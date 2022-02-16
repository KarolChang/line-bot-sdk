import axios from 'axios'

const baseURL = 'http://jm-expense-mysql.herokuapp.com'
const apiHelper = axios.create({
  baseURL
})

export default {
  getRecords() {
    return apiHelper.get('/record/all')
  }
}
