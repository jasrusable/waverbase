extern crate rand;
extern crate rustc_serialize;

use rustc_serialize::{json, Encodable};
use rand::distributions::{IndependentSample, Range};
use std::env;
use std::net::{TcpListener, TcpStream};
use std::thread;
use std::sync::mpsc::{Receiver, Sender, channel};
use std::io::{Read, Write};
use std::time::Duration;
use std::str;
use std::process::Command;

#[derive(RustcEncodable, RustcDecodable)]
enum MessageType {
    AnnounceNumber,
    AcknowledgeWinner
}

#[derive(RustcEncodable, RustcDecodable)]
struct Message {
    message_type: MessageType,
    my_number: u64,
    winner: String,
    sender: String
}

struct Remote {
    stream: TcpStream,
    current_length: i64,
    buf: Vec<u8>
}

impl Remote {
    fn new(stream: TcpStream) -> Remote {
        Remote {
            stream: stream,
            current_length: 0,
            buf: Vec::new()
        }
    }
    
    fn send(&mut self, message: &[u8]) {
        let message_size : usize = message.len();
        let message_size = [
            (message_size & 0xFF) as u8,
            ((message_size >> 8) & 0xFF) as u8,
            ((message_size >> 16) & 0xFF) as u8,
            ((message_size >> 24) & 0xFF) as u8
        ];
        self.stream.write(&message_size).unwrap();
        self.stream.write(message).unwrap();
    }

    fn read_into_buf(&mut self) {
        let mut b = [0u8; 4096];
        let read = self.stream.read(&mut b).unwrap();
        if read > 0 {
            self.buf.extend_from_slice(&b[0..read]);
        }
    }
    
    
    // returns a single message from the socket
    fn receive(&mut self) -> Vec<u8> {
        loop {
            // remove messages from buffer
            if self.current_length > 0 && self.buf.len() >= (self.current_length as usize) {
                let remain = self.buf.split_off(self.current_length as usize);
                let message = self.buf.clone();
                self.buf = remain;
                assert_eq!(message.len(), self.current_length as usize);

                self.current_length = 0;
                return message;
            } else {
                self.read_into_buf();
            }

            if self.current_length == 0 {
                self.current_length = ((self.buf[0] as u64) |
                                 (self.buf[1] as u64) >> 8 |
                                (self.buf[2] as u64) >> 16 | 
                                (self.buf[3] as u64) >> 24) as i64;
                self.buf = self.buf.split_off(4);
            }
        }
        
    }
    
}

fn listen_for_peers(listen_at: &str, stream_channel: Sender<TcpStream>) {
    let stream_channel = stream_channel.clone();
    let listener = TcpListener::bind(listen_at).unwrap();
    println!("Listening at {}", listen_at);
    thread::spawn(move|| {
        for stream in listener.incoming() {
            match stream {
                Ok(stream) => {
                    stream_channel.send(stream).unwrap();
                }
                Err(e) => {
                    println!("ahhhhhh! {}", e);
                }
            }
        }
    });
}


struct Peers {
    outgoing_peers: Vec<Remote>,
    incoming_peers: Vec<Remote>,
}

impl Peers {
    pub fn new() -> Peers {
        Peers {
            outgoing_peers: vec![],
            incoming_peers: vec![]
        }
    }
    
    fn send_all(&mut self, message: Message) {
        let message = json::encode(&message).unwrap();
        let message = message.as_bytes();

        for outgoing_peer in &mut self.outgoing_peers {
            outgoing_peer.send(&message);
        }
    }

    fn receive_all(&mut self) -> Vec<Message> {
        let mut messages = Vec::new();

        for incoming_peer in &mut self.incoming_peers {
            let message = incoming_peer.receive();
            let message = str::from_utf8(message.as_slice()).unwrap();
            let message: Message = json::decode(message).unwrap();
            messages.push(message);
        }
        messages
    }

    fn connect_to_peers(&mut self, peers: &Vec<String>) {
        for peer_string in peers {
            for _ in 0..10 {
                let stream = TcpStream::connect(peer_string.as_str());
                match stream {
                    Ok(stream) => {
                        println!("Connected to {}", peer_string);
                        self.outgoing_peers.push(Remote::new(stream));
                        break;
                    },
                    Err(_) => {
                        println!("Waiting...");
                        thread::sleep(Duration::new(1, 0));
                    }
                }
            }
        }
    }

    fn wait_for_peers(&mut self, stream_channel: Receiver<TcpStream>, num_candidates: usize) {
        for _ in 0..num_candidates {
            self.incoming_peers.push(Remote::new(stream_channel.recv().unwrap()));
        }
    }
}

fn elect_leader(candidates: &Vec<String>, me: &String) -> bool {
    let (tx_peers, rx_peers) = channel();
    let mut peers = Peers::new();

    listen_for_peers(me, tx_peers);
    peers.connect_to_peers(&candidates);
    peers.wait_for_peers(rx_peers, candidates.len());

    let mut rng = rand::thread_rng();
    let number = Range::new(0, 1_000_000).ind_sample(&mut rng);

    println!("My number is {}", number);

    peers.send_all(Message {
        message_type: MessageType::AnnounceNumber,
        my_number: number,
        winner: "".to_string(),
        sender: me.clone()
    });

    println!("Waiting for numbers");
    let announce_numbers = peers.receive_all();

    let mut max_number = number;
    let mut max_number_sender = me.to_string();

    for other_number in announce_numbers {
        println!("other number {} {}", other_number.my_number, other_number.sender);
        if other_number.my_number > max_number {
            max_number = other_number.my_number;
            max_number_sender = other_number.sender;
        }
    }

    println!("The winner is {}", max_number_sender);

    peers.send_all(Message {
        message_type: MessageType::AcknowledgeWinner,
        my_number: number,
        winner: max_number_sender.clone(),
        sender: me.to_string()
    });

    let other_winners = peers.receive_all();
    for other_winner in other_winners {
        if other_winner.winner != max_number_sender {
            println!("failed to reach agreement");
            return false;
        }
        
    }

    max_number_sender == me.to_string()
}

fn main() {
    let args = env::args();
    // program name
    let mut args = args.skip(1);
    let master_script = args.next().unwrap();
    let mut candidates : Vec<String> = Vec::new();
    for _ in 1..(env::args().count()-2) {
        let candidate = args.next().unwrap();
    	candidates.push(candidate);
    }

    let me_index = args.next().unwrap();
    let me_index : usize = me_index.parse().unwrap();
    let me = candidates[me_index-1].clone();
    candidates.remove(me_index-1);

    let leader_arg: &str;
    if elect_leader(&candidates, &me) {
        leader_arg = "master";
    } else {
        leader_arg = "slave";
    }
        
    Command::new("bash")
        .arg(master_script)
        .arg(leader_arg)
        .spawn()
        .ok()
        .expect("Failed to run master script");
}
