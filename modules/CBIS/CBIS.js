const request = require('request-promise');
const randomstring = require('randomstring');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync;
const Xray = require('x-ray');
let X = Xray();

class CBIS{
    constructor(nim,pin, temp = '', endpoint='http://fti.upnyk.ac.id'){
        this.data = {
            nim : nim,
            pin : pin,
            session : undefined,
            phpsessid : undefined,
            captcha : {
                file : undefined,
                eval : 0,
                ocr : ''
            },
            jar : []
        };
        this.ready = false;
        this.temp = path.join(temp,''+nim);
        let cred_path = path.join(this.temp,`${nim}.json`);
        if (!fs.existsSync(this.temp)){
            fs.mkdirSync(this.temp);
        }
        if(fs.existsSync(cred_path)){
            let creds = JSON.parse(fs.readFileSync(cred_path, 'utf8'));
            this.data.session = creds.session;
            this.data.phpsessid = creds.phpsessid;
            this.data.captcha = creds.captcha;
            this.data.jar = creds.jar;
        }else{
            const {session, phpsessid, captcha, jar} = this.data;
            let cred_path = path.join(this.temp,`${this.data.nim}.json`);
            let credential = {
                session : session,
                phpsessid: phpsessid,
                captcha : captcha,
                jar : jar
            };
            fs.writeFileSync(cred_path,JSON.stringify(credential),'utf8');
        }
        this.endpoint = endpoint;
    }
    url(node){
        node = node[0] === '/'? node:'/'+node;
        return this.endpoint + node;
    }
    async session(node){
        node = node[0] === '/'? node:'/'+node;
        if(!this.data.session) await this.login();
        return this.url(`session/${this.data.session}${node}`);
    }
    async check(){
        let hasil =false;
        
        if(this.data.session === undefined) return false;
        
        await request({
            jar : this.buildCookie(),
            url:this.url(`session/${this.data.session}/menusdm.html`),
        }).then(r => {
            hasil = r.match(this.data.session) !== undefined && r.match(this.data.session) !== null;
        });
        return hasil;
    }
    async updateCreds(){
        const {session, phpsessid, captcha, jar} = this.data;
        let cred_path = path.join(this.temp,`${this.data.nim}.json`);
        let credential = {
            session : session,
            phpsessid: phpsessid,
            captcha : captcha,
            jar : jar
        };
        fs.writeFileSync(cred_path,JSON.stringify(credential),'utf8');
    }
    async getCaptcha(){
        let c_path = this.data.captcha && this.data.captcha.file?this.data.captcha.file:path.join(this.temp,randomstring.generate()+'.png');
        let resource = fs.createWriteStream(c_path);
        let that = this;
        // this.data.jar = request.jar();
        let x = await request({
            url : `${this.url('c.php')}`,
            method:'GET',
            encoding: null,
            headers:{
                'Content-Type': 'image/png'
            },
            jar: this.data.jar,
            transform:(body, response, resolveWithFullResponse)=>{
                if(response.toJSON().headers['set-cookie']){
                    that.data.jar.push(response.toJSON().headers['set-cookie'][0]);
                    that.data.phpsessid = response.toJSON().headers['set-cookie'][0].match(/PHPSESSID=([^;]+)/)[1];
                }
                return body;
            }
        }).then(r => {
            resource.write(r,'binary');
            resource.end();

        });
        const command = `tesseract "${c_path}" stdout --oem 0 --psm 13 -c tessedit_char_whitelist=+0123546789`;
        let stdout = exec(command).toString().split('\r\n')[0];
        that.data.captcha = {
            file : c_path,
            ocr : stdout,
            eval : eval(stdout)
        };
        await that.updateCreds();
    }
    buildCookie(){
        let jar = request.jar();
        for(let i in this.data.jar){
            jar.setCookie(request.cookie(this.data.jar[i]), this.endpoint);
        }
        return jar;
    }
    async login(){
        let check_ = await this.check();

        if (!(this.data.session && check_)) {
            await this.getCaptcha();
            let that = this;

            await request({
                url: that.url('login.html'),
                method: 'POST',
                formData: {
                    user_id: that.data.nim,
                    pwd0: that.data.pin,
                    fcaptcha: that.data.captcha.eval,
                    submit1: "login"
                },
                jar: that.buildCookie(),
                transform: (body, response, resolveWithFullResponse) => {
                    for (let i in response.toJSON().headers['set-cookie']) {

                        that.data.jar.push(response.toJSON().headers['set-cookie'][i]);

                    }

                    return body;
                }
            }).then(r => {
                let result = r.match(/session\/([^\/]+)/);
                if (result === null) {
                    that.data.session = undefined;
                    that.updateCreds();
                } else {
                    that.data.session = result[1];
                    that.updateCreds();
                    that.check();
                    that.ready = true;
                }
            }).error(e=>{
                console.log(e);
                throw Error(e);
            });
        }
        if(this.data.session === undefined)
            throw Error('PIN bermasalah');
    }
    async transkrip(){
        await this.login();
        let html = '';
        await request({
            url: await this.session('transkrip.html'),
            jar:this.buildCookie(),
        }).then(r=>html=r).error(e=>console.log(e));
        let result = {};
        await X(html,'tr',[{
            no : 'td:nth-child(1)',
            kur : 'td:nth-child(2)',
            kode_mk : 'td:nth-child(3)',
            nama_mk : 'td:nth-child(4)',
            sks : 'td:nth-child(5)',
            klp : 'td:nth-child(6)',
            ke : 'td:nth-child(7)',
            sesi : 'td:nth-child(8)',
            nilai : 'td:nth-child(9)',
        }]).then(res=>{
            res.shift();
            let cut = 0;
            for(let i in res){
                if(res[i].no === '1') cut++;
                if(cut === 2){
                    res.splice(i-1,res.length-i+1);
                    break;
                }
            }
            result['data'] = res;
        }).error(e=>console.log(e));
        await X(html,{
            ipk: '#bigyellow',
            sks: '[bgcolor=#0011aa]'
        }).then(res=>{
            result['ipk'] = res.ipk;
            let total = 0;
            for(let i in result){
                total+=result[i].sks
            }
            result['sks'] = res.sks.match(/÷ (\d+)/)[1];
        }).error(e=>console.log(e));
        return result;
    }
    async biodata(){
        await this.login();
        let html = '';
        await request({
            url: await this.session('editbiodatamhs.html'),
            jar:this.buildCookie(),
        }).then(r=>html=r);
        let result = [];
        await X(html,'tr.header.hijau',[{
            key : 'td:nth-child(1)',
            value : 'td:nth-child(2)',
            select : 'td:nth-child(2) select option[selected]',
            checkbox : 'td:nth-child(2) input[checked]@value',
            input : 'td:nth-child(2) input[type=text]@value',
            tgl_lahir : X('td:nth-child(2)',{
                tempat : 'input[name=tmp_lahir]@value',
                d : 'input[name=dd]@value',
                m : 'select[name=mm] option[selected]@value',
                Y : 'input[name=yyyy]@value',
            })
        }]).then(r => {
            result = r;
            for(let i in result){
                result[i].key = result[i].key.replace(/(\r\n|\n|\r)/gm,"");
                result[i].value = result[i].value.replace(/(\r\n|\n|\r)/gm,"");
                if('select' in result[i] && result[i].select){
                    result[i].value = result[i].select.replace(/(\r\n|\n|\r)/gm,"");
                    delete result[i].select;
                }
                if('checkbox' in result[i] && result[i].checkbox){
                    result[i].value = result[i].checkbox.replace(/(\r\n|\n|\r)/gm,"");
                    delete result[i].checkbox;
                }
                if('input' in result[i] && result[i].input){
                    result[i].value = result[i].input.replace(/(\r\n|\n|\r)/gm,"");
                    delete result[i].input;
                }
                if('tgl_lahir' in result[i]){
                    if('Y' in result[i].tgl_lahir)
                        result[i].value = result[i].tgl_lahir;
                    delete result[i].tgl_lahir;
                }

            }
        });
        let Array = {};
        for(let i in result){
            Array[result[i].key.replace(':','')] = result[i].value;
        }
        return Array;
    }
    async KRP(old = false){
        await this.login();
        let html = '';
        await request({
            url: await this.session('nilai.html'),
            jar:this.buildCookie(),
        }).then(r=>html=r);
        let result = {
            list: [],
            data: []
        };
        await X(html,'tr.cell-kosong',[{
            link : 'td:nth-child(1) a@href',
            name : 'td:nth-child(1) a',
            tahun : 'td:nth-child(2) a'
        }]).then(r =>{
            result.list = r;
        });
        if(old===false){
            await X(html,'tr.cell',[{
                tahun : 'td:nth-child(1) center',
                kode_mk : 'td:nth-child(2)',
                nama_mk : 'td:nth-child(3)',
                sks : 'td:nth-child(4)',
                kls : 'td:nth-child(5)',
                kelp : 'td:nth-child(6)',
                nilai : 'td:nth-child(7)',
            }]).then(r =>{
                result.data = r;
            });
        }else{
            if(old < 0 && old >= result.list.length) return false;
            await request({
                url: await this.url(result.list[old].link),
                jar: this.buildCookie(),
            }).then(r=>html=r);
            await X(html,'tr.cell',[{
                tahun : 'td:nth-child(1) center',
                kode_mk : 'td:nth-child(2)',
                nama_mk : 'td:nth-child(3)',
                sks : 'td:nth-child(4)',
                kls : 'td:nth-child(5)',
                kelp : 'td:nth-child(6)',
                nilai : 'td:nth-child(7)',
            }]).then(r =>{
                result.data = r;
            });
        }
        
        return result;
    }
}
module.exports = CBIS;