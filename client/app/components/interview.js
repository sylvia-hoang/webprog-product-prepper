import React from 'react';
import VoiceChat from "./voicechat";
import Questions from "./interviewquestions";
import CodeEditor from "./codeeditor";
import {getInterviewSession} from '../server';

window.webrtc = {};


export default class Interview extends React.Component {
  constructor(props) {
    super(props);
    this.video = true;
    this.muted = true;
    this.volume = 1;
    this.state = {interview: {
      problem: {
        title: ""
      },
      interviewer: {
        _id: ""
      },
      interviewee: {
        _id: ""
      }
    }};
  }

  refresh() {
    getInterviewSession(this.props.params.interviewId, (interviewData) => {
      this.setState({interview: interviewData});
    });
  }

  componentDidMount() {
    this.refresh();
  }

  componentDidUpdate() {
    var ICEServers = {
      iceServers: [
        {
          url: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com'
        },
        {
            url: 'turn:192.158.29.39:3478?transport=udp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        },
        {
            url: 'turn:192.158.29.39:3478?transport=tcp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        }
      ]
    }
    webrtc = new SimpleWebRTC({
      // the id/element dom element that will hold "our" video
      localVideoEl: 'localVideo',
      // the id/element dom element that will hold remote videos
      remoteVideosEl: 'remotesVideos',
      // immediately ask for camera access
      autoRequestMedia: true,
      debug: true,
      media: { video: true, audio: true},
      peerConnectionConfig: ICEServers,
      url: 'http://project-webrtc.herokuapp.com'
    });
    // we have to wait until it's ready
    webrtc.on('readyToCall', function () {
      // you can name it anything
      var roomName = prompt('Please enter a voice chat room name', 'your awesome room name');
      webrtc.joinRoom(roomName);
    }.bind(this));
  }

  onVolume(e) {
    e.preventDefault();
    this.volume = (this.volume === 0) ? 1 : 0;
    console.log("toggle volume " + this.volume);
    webrtc.setVolumeForAll(this.volume);
  }

  onMicro(e) {
    e.preventDefault();
    this.micro = (this.micro) ? false : true;
    console.log("toggle micro " + this.micro);
    if (this.micro) {
      webrtc.unmute();
    }
    else {
      webrtc.mute();
    }
  }

  onVideo(e) {
    e.preventDefault();
    this.video = (this.video) ? false : true;
    console.log("toggle video " + this.video);
    if (this.video) {
      webrtc.resumeVideo();
    }
    else {
      webrtc.pauseVideo();
    }
  }

  render() {
    return (
      <div className="component-container">
        <div className="row">
          <div className="col-md-4">
            <VoiceChat onVolume={(e) => this.onVolume(e)} onVideo={(e) => this.onVideo(e)} onMicro={(e) => this.onMicro(e)}></VoiceChat>
            <video height="200" id="localVideo"></video>
            <div className="remotesVideos" ref={(ref) => this.remotes = ref} id="remotesVideos"></div>
            <Questions interviewquestion={this.state.interview}/>
          </div>
          <CodeEditor interviewerId={this.state.interview.interviewer._id} intervieweeId={this.state.interview.interviewee._id} interviewId={this.props.params.interviewId} />
        </div>
      </div>
    )
  }

  componentWillUnmount() {
    webrtc.stopLocalVideo();
    webrtc.leaveRoom();
    webrtc.disconnect();
  }
}
