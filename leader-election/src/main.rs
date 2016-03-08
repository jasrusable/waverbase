extern crate rand;
extern crate rustc_serialize;

use rustc_serialize::{json, Encodable};
use rand::distributions::{IndependentSample, Range};
use std::env;
use std::net::{TcpListener, TcpStream};
use std::thread;
use std::sync::mpsc::{Receiver, Sender, channel};
use std::io::{Read, Write};

#[derive(RustcEncodable)]
enum MessageType {
    AnnounceNumber,
    AcknowledgeWinner
}

#[derive(RustcEncodable)]
struct Message {
    message_type: MessageType,
    my_number: u64,
    winner: String,
    sender: String
}

fn listen_for_peers(listen_at: &str, stream_channel: Sender<TcpStream>) {
    let stream_channel = stream_channel.clone();
    let listener = TcpListener::bind(listen_at).unwrap();
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
    outgoing_peers: Vec<TcpStream>,
    incoming_peers: Vec<TcpStream>,
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
        let message_size : usize = message.len();
        let message_size = [
            (message_size & 0xFF) as u8,
            ((message_size >> 8) & 0xFF) as u8,
            ((message_size >> 16) & 0xFF) as u8,
            ((message_size >> 24) & 0xFF) as u8
        ];
        for outgoing_peer in &mut self.outgoing_peers {
            outgoing_peer.write(&message_size).unwrap();
            outgoing_peer.write(message).unwrap();
        }
        unimplemented!();
        
    }

    fn receive_all(&mut self) -> Vec<Message> {
        //let mut messages = Vec<Message>;

        for incoming_peer in &mut self.incoming_peers {
            let mut size : [u8; 4] = [0, 0, 0, 0];
            incoming_peer.read_exact(&mut size).unwrap();
            let size = (size[0] as u64) &
                (size[1] as u64) << 8 &
                (size[2] as u64) << 16 &
                (size[3] as u64) << 24;

        }
        unimplemented!();
    }

    fn connect_to_peers(&mut self, peers: &Vec<String>) {
        for peer_string in peers {
            self.outgoing_peers.push(TcpStream::connect(peer_string.as_str()).unwrap());
        }
    }

    fn wait_for_peers(&mut self, stream_channel: Receiver<TcpStream>, num_candidates: usize) {
        for _ in 0..num_candidates {
            self.incoming_peers.push(stream_channel.recv().unwrap());
        }
    }
}

fn elect_leader(candidates: &Vec<String>, me: &String) {
    let (tx_peers, rx_peers) = channel();
    let mut peers = Peers::new();

    listen_for_peers("127.0.0.1:8000", tx_peers);
    peers.connect_to_peers(&candidates);
    peers.wait_for_peers(rx_peers, candidates.len()-1);

    let mut rng = rand::thread_rng();
    let number = Range::new(0, 1_000_000).ind_sample(&mut rng);

    peers.send_all(Message {
        message_type: MessageType::AnnounceNumber,
        my_number: number,
        winner: "".to_string(),
        sender: "NOTME".to_string()
    });

    let announce_numbers = peers.receive_all();

    let mut max_number = number;
    let mut max_number_sender = "ME".to_string();

    for other_number in announce_numbers {
        if other_number.my_number > max_number {
            max_number = other_number.my_number;
            max_number_sender = other_number.sender;
        }
    }

    peers.send_all(Message {
        message_type: MessageType::AnnounceNumber,
        my_number: number,
        winner: "".to_string(),
        sender: "NOTME".to_string()
    });
}

fn main() {
    let mut args = env::args();
    // program name
    let mut args = args.skip(1);
    let mut candidates : Vec<String> = Vec::new();
    for _ in 1..(env::args().count()-1) {
        let candidate = args.next().unwrap();
    	candidates.push(candidate);
    }

    let me_index = args.next().unwrap();
    let me_index : usize = me_index.parse().unwrap();
    candidates.remove(me_index-1);

    let me = &candidates[me_index-1];

    elect_leader(&candidates, me);
}
