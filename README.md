This is a crude react app implementation of the nats-chat room.

After Cloning this repo,

Run:
npm install

Copy the nats-server binary file, the nats.conf configuration file and the certs folder from your natsws-sandbox repo in to this repo

Run:
npm run start-nats

and in another terminal 
Run:
npn run start-http

You will be able to communicate between two or more browser windows on your machine, the messages sent can be seen in the console of the browsers, kindly continue with this or maybe try a different approach.