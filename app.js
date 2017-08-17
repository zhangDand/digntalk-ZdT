const superagent = require('superagent')
    // const request = require('requset')

const tokenhost = 'https://oapi.dingtalk.com/gettoken'
const corpId = 'ding681626987e81366935c2f4657eb6378f'
const corpSecret = 'EGdNOA5xt-MILQy49L1y5peVQFKkKtMQ_S-HdGsemkujaebSiBt2cemXYnrZjO2k'

const host = 'https://oapi.dingtalk.com'
const departmentlist = '/department/list'
const authscopes = '/auth/scopes';


(async function() {
    async function gottoken(tokenhost, corpId, corpSecret) {
        return new Promise(function(resolve, reject) {
            superagent
                .get(tokenhost)
                .query({ corpid: corpId })
                .query({ corpsecret: corpSecret })
                .end((err, res) => {
                    // console.log(res.text)
                    // token = { access_token: res.body.access_token }
                    resolve({ access_token: res.body.access_token })
                })
        })
    }
    let token = await gottoken(tokenhost, corpId, corpSecret);
    setInterval(async function() {
        token = await gottoken(tokenhost, corpId, corpSecret)
    }, 30);
    async function getscopes() {
        // let token = await gottoken(tokenhost, corpId, corpSecret)
        return new Promise(function(resolve, reject) {
            superagent
                .get(host + authscopes)
                .query(token)
                .end((err, res) => {
                    resolve(res.body)
                })
        })
    }
    async function getdepartment() {
        // let token = await gottoken(tokenhost, corpId, corpSecret)
        let authscopes = await getscopes()
        superagent
            .get(host + departmentlist)
            .query(token)
            .end((err, res) => {
                console.log(res.text)
            })
    }


    (async function() {
        console.log(await getscopes())
    })()
})()