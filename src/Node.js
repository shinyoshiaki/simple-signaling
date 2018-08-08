"use strict";

import http from "http";
import socketio from "socket.io";

const def = {
  CHECK: "CHECK",
  OFFER: "OFFER",
  ANSWER: "ANSWER",
  GET_OFFER: "GET_OFFER"
};

const offerList = {},
  id2socketId = {};

export default class PortalNode {
  constructor(myPort) {
    this.myPort = myPort;

    this.srv = http.Server();
    this.io = socketio(this.srv);
    this.srv.listen(this.myPort);

    this.io.on("connection", socket => {
      console.log("connect", socket.id);

      socket.on(def.CHECK_OFFER, targetId => {
        if (Object.keys(offerList).includes(targetId)) {
          this.io.sockets.sockets[socket.id].emit(def.CHECK_OFFER, "exist");
        } else {
          this.io.sockets.sockets[socket.id].emit(def.CHECK_OFFER, "un_exist");
        }
      });

      socket.on(def.OFFER, (data = { id: "", sdp: "" }) => {
        console.log("add offer", data.id, socket.id);
        offerList[data.id] = data.sdp;
        id2socketId[data.id] = socket.id;
      });

      socket.on(def.GET_OFFER, targetId => {
        if (Object.keys(offerList).includes(targetId)) {
          this.io.sockets.sockets[socket.id].emit(
            def.GET_OFFER,
            offerList[targetId]
          );
        }
      });

      socket.on(def.ANSWER, (data = { targetId: "", sdp: "" }) => {
        console.log(id2socketId, data.targetId);
        if (Object.keys(id2socketId).includes(data.targetId)) {
          console.log("add answer", data.targetId, id2socketId[data.targetId]);

          this.io.sockets.sockets[id2socketId[data.targetId]].emit(
            def.ANSER,
            data.sdp
          );

          delete offerList[data.targetId];
          delete id2socketId[data.targetId];
        }
      });
    });
  }
}
