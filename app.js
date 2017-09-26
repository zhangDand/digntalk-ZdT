const superagent = require('superagent')
    // const request = require('requset')

const tokenhost = 'https://oapi.dingtalk.com/gettoken'
const corpId = 'ding681626987e81366935c2f4657eb6378f'
    const corpSecret = 'EGdNOA5xt-MILQy49L1y5peVQFKkKtMQ_S-HdGsemkujaebSiBt2cemXYnrZjO2k'
// const corpSecret = 'I1cd1UUlJd744BK2cL2uHGwPx2CbQdbus_rxEHKJlTNeZeaKFcsCD_hLwgxIeMQX'
const host = 'https://oapi.dingtalk.com'
const departmentlist = '/department/list'
const authscopes = '/auth/scopes';
const attendancelist = '/attendance/list'
const usersimplelist = '/user/simplelist'

!!(async function() {
    // 获取计时工部门的token
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

    // 获取token的授权范围
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
    // 获取token授权范围内的部门列表
    async function getDepartmentList() {

        let deptIds = await getScopesDeptId()
        let box = []

        async function getSubDeptIds(deptId) {
            return new Promise(function(resolve, reject) {
                superagent
                    .get(host + departmentlist)
                    .query(token)
                    .query({ id: deptId })
                    .end((err, res) => {
                        if (!err) {
                            resolve(res.body.department)
                        }
                    })
            })
        }
        async function getAllIdsFromId(deptId, box) {
            let depts = await getSubDeptIds(deptId)
            if (!depts.length == 0) {
                depts.forEach(async function(element) {
                    box.push(element)
                    await getAllIdsFromId(element.id, box)
                }, this);
            } else {

            }
        }
        for (let id of deptIds) {
            await getAllIdsFromId(id, box)
        }
        return box
    }

    // 获取授权范围内的部门ID列表
    async function getScopesDeptId() {
        let scopes = (await getscopes())

        let depts = scopes.auth_org_scopes.authed_dept
        return depts
    }
    // 获取部门成员
    async function getMenberFromId(id) {
        return new Promise(function(resolve, reject) {
            superagent
                .get(host + usersimplelist)
                .query(token)
                .query({ department_id: id })
                .end((err, res) => {
                    if (!err) {
                        resolve(res.body.userlist)
                    }

                })
        })
    }
    async function getAllMenber() {
        let depts = await getDepartmentList()
        let menberlist = []
        for (let dept of depts) {
            let menbers = await getMenberFromId(dept.id)
            menberlist = menberlist.concat(menbers)
        }

        return menberlist
    }
    // 获取全部打卡结果列表
    async function getAttendanceList() {
        superagent
            .post(host + attendancelist)
            .query(token)
            .send({
                'workDateFrom': '2017-8-11 00:00:00',
                'workDateTo': '2017-8-16 23:59:00',
            })
            .end((err, res) => {
                if (!err) {

                }
            })
    }
    
    async function getAttendance(menber,date){``
        let dateStart = date+" "+"00:00:00"
        let dateEnd = date+" "+"23:59:59"
        return new Promise((resolve,reject)=>{

            superagent
                .post(host + attendancelist)
                .query(token)
                .send({
                    "userId":menber.userid,
                    'workDateFrom':dateStart,
                    'workDateTo':dateEnd,
                })
                .end((err,res)=>{
                    resolve(res.body)
                })
        })
    }
    !(async function() {
        let menberlist = await getAllMenber()
        let recordresults = []
        console.log(menberlist)
        for(let menber of menberlist){
            let result = await getAttendance(menber,"2017-9-20")
            if(result.recordresult.length!==0){
                result.name = menber.name
                recordresults.push(result)
            }
        }
        console.log(recordresults)
        function parseResults(resultList){ // 解析打卡结果列表，返回可视化打卡结果
            let arr=[]
            for(let r of resultList){ //遍历所有打卡结果
                let out = {}
                out.name = r.name
                out.result = new Date(r.recordresult[0].baseCheckTime)

                arr.push(out)
            }
            console.log(arr)
        }
        parseResults(recordresults)
    })()

})()