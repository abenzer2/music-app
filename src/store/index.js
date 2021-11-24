import { createStore } from "vuex";
import { auth, usersCollection } from "../includes/firebase";
import {Howl} from 'howler';
import helper from '../includes/helper'

export default createStore({
  state: {
    authModalShow: false,
    userLoggedIn: false,
    currentSong: {},
    sound: {},
    seek: '00:00',
    duration: '00:00',
    playerProgress: '0%'
  },
  mutations: {
    toggleAuthModal: (state) => {
      state.authModalShow = !state.authModalShow;
    },
    toggleAuth : (state) => {
      state.userLoggedIn= !state.userLoggedIn
    },
    newSong(state, payload){
      state.currentSong = payload;
      state.sound = new Howl({
        src: [payload.url],
        html5: true
      })
    },
    updatePosition(state) {
      state.seek =helper.formatTime(state.sound.seek()) ;
      state.duration=helper.formatTime(state.sound.duration()) ;
      state.playerProgress= (state.sound.seek() / state.sound.duration()) * 100 + "%"
    }
  },
  getters: {
    playing: (state) => {
      if(state.sound.playing) {
        return state.sound.playing()
      }
      return false;
    }
  },
  actions: {
   async register({commit}, payload) {
   const userCred = await auth.createUserWithEmailAndPassword(
      payload.email,
      payload.password
    );

    await usersCollection.doc(userCred.user.uid).set({
      name: payload.name,
      email: payload.email,
      age: payload.age,
      country: payload.country,
    });

    await userCred.user.updateProfile({
      displayName: payload.name
    })

    commit('toggleAuth');

    },
    async login({commit}, payload){
     await auth.signInWithEmailAndPassword(payload.email, payload.password);

     commit('toggleAuth')
    },
    async signOut({commit}) {
      await auth.signOut();
      commit('toggleAuth');
      // window.location.reload();
    },
    init_login({commit}) {
      const user = auth.currentUser;
      if(user){
        commit('toggleAuth')
      }
    },
    async newSong({commit, state, dispatch}, payload) {


      if(state.sound instanceof Howl ) {
        state.sound.unload();
      }

      console.log('new song to play',payload)
      commit('newSong', payload);

      state.sound.play();

      state.sound.on('play', ()=>{
        requestAnimationFrame(()=>{
          dispatch('progress');
        })
      })
    },
    async toggleAudio({state}) {
      // console.log('toggle')
      if(!state.sound.playing) {
        console.log('nothing')
        return;
      }

      if(state.sound.playing()) {
        // console.log('from playing to pause')
        state.sound.pause();
      }
      else {
        // console.log('from pause to play')
        state.sound.play()
      }

    },
    progress({commit, state, dispatch}) {
      commit('updatePosition');
      if(state.sound.playing()){
        requestAnimationFrame(()=>{
          dispatch('progress')
        })
      }
    },
    updateSeek({state,dispatch}, payload) {
      console.log('update seek')
      if(!state.sound.playing){
        console.log('returning')
        return;
      }

      const { x , width} = payload.currentTarget.getBoundingClientRect();

      console.log('x',x,'width', width)
      const clickX = payload.clientX - x;

      const percentage = clickX/width;
      const seconds = state.sound.duration() * percentage;

      state.sound.seek(seconds);

      state.sound.once('seek', () => {
        dispatch('progress');
      })

    }
  }
});
