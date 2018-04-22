import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

const http = axios.create({
  baseURL: `http://localhost:3000/api`
})

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    words: [],
    currentTestWords: [],
    testIndex: 0
  },
  mutations: {
    addWord (state, newWord) {
      state.words.push(newWord)
    },
    setWords (state, words) {
      state.words = words
    },
    removeWord (state, index) {
      state.words.splice(index, 1)
    },
    newTest (state) {
      state.testIndex = 0
      state.currentTestWords = this.getters.randomWords().map((word) => {
        return {
          ...word,
          guess: '',
          success: false
        }
      })
    },
    submitGuess (state, guess) {
      const currentWord = state.currentTestWords[state.testIndex]
      currentWord.guess = guess
      currentWord.success = guess.toLowerCase() === currentWord.foreign.toLowerCase()
      state.testIndex++
    }
  },
  actions: {
    async addWord (context, newWord) {
      const response = await http.post('words', newWord)

      if (response.status === 200) {
        context.commit('addWord', response.data)
      }
    },
    async removeWord (context, index) {
      const word = context.state.words[index]
      const response = await http.delete(`words/${word.id}`)

      if (response.status === 200) {
        context.commit('removeWord', index)
      }
    },
    async newTest (context) {
      if (context.state.currentTestWords.length === 0) {
        await context.dispatch('fetchWords')
      }

      context.commit('newTest')
    },
    submitGuess (context, guess) {
      context.commit('submitGuess', guess)
    },
    async fetchWords (context) {
      const response = await http.get('words')

      if (response.status === 200) {
        context.commit('setWords', response.data)
      }
    }
  },
  getters: {
    // returns an array of random words
    // use the amount parameter to change the size of the array
    randomWords: (state) => (amount = 20) => {
      const random = []
      for (var i = amount - 1; i >= 0; i--) {
        random.push(state.words[Math.floor(Math.random() * state.words.length)])
      }
      return random
    },
    currentTestWord: (state) => {
      return state.currentTestWords[state.testIndex]
    },
    testIsFinished: (state) => {
      return state.currentTestWords.length <= state.testIndex
    },
    testProgress: (state) => {
      return Math.round(state.testIndex / state.currentTestWords.length * 100)
    },
    score: (state) => {
      if (state.currentTestWords.length === 0) {
        return 0
      }

      const successCount = state.currentTestWords
        .map(word => word.success ? 1 : 0)
        .reduce((acc, num) => acc + num, 0)

      return Math.round(successCount / state.currentTestWords.length * 100)
    }
  }
})
