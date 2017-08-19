const superagent = require('superagent')
    // const request = require('requset')

const tokenhost = 'https://oapi.dingtalk.com/gettoken'
const corpId = 'ding681626987e81366935c2f4657eb6378f'
const corpSecret = 'EGdNOA5xt-MILQy49L1y5peVQFKkKtMQ_S-HdGsemkujaebSiBt2cemXYnrZjO2k'

const host = 'https://oapi.dingtalk.com'
const departmentlist = '/department/list'
const authscopes = '/auth/scopes';
const attendancelist = '/attendance/list'
const usersimplelist = '/user/simplelist' 
!!(async function() {
    
    async function gottoken(tokenhost, corpId, corpSecret) {
        return new Promise(function(resolve, reject) {
            superagent
                .get(tokenhost)
                .query({ corpid: corpId })
                .query({ corpsecret: corpSecret })
                .end((err, res) => {
                    // 
                    // token = { access_token: res.body.access_token }
                    resolve({ access_token: res.body.access_token })
                })
        })
    }
    let token = await gottoken(tokenhost, corpId, corpSecret);
    setInterval(async function() {
        token = await gottoken(tokenhost, corpId, corpSecret)
    }, 7200);
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
    async function getdepartmentlist() {
        // let token = await gottoken(tokenhost, corpId, corpSecret)
        let authscopes = await getscopes()
        superagent
            .get(host + departmentlist)
            .query(token)
            .end((err, res) => {
                
            })
    }

    // 获取授权范围内的部门ID列表
    async function getScopesDeptId(){
        let scopes = (await getscopes())
        
        let depts = scopes.auth_org_scopes.authed_dept
        return depts
    }
    // 获取部门成员
    async function getDeptMenberId(){
        let depts = await getScopesDeptId()
        let menbers = []
        superagent
            .get(host + usersimplelist)
            .query(token)
            .query({department_id:depts})
            .end((err,res)=>{
                console.log(res.body)
            })
    }
    // 获取全部打卡结果列表
    async function getAttendanceList(){
        superagent
            .post(host + attendancelist)
            .query(token)
            .send({
                'workDateFrom':'2017-8-11 00:00:00',
                'workDateTo' : '2017-8-16 23:59:00',
            })
            .end((err, res)=>{
                if(!err){
                    
                }
            })
    }

    !(async function() {
        // 
        // 
        // 
        console.log(getDeptMenberId());
    })()

})()