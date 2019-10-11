const Xray = require('x-ray');
let X = Xray();
const nodeFetch = require('node-fetch');
const Headers = nodeFetch.Headers;
const fetch = require('fetch-cookie/node-fetch')(nodeFetch);
const base91 = require('node-base91');
const formdata = require('form-data');
const request = require('request');
const fs = require('fs');
const endpoint = {
    base : 'https://www.turnitin.com/',
    login : 'https://www.turnitin.com/login_page.asp?lang=en_us',
};

class Turnitin {
    constructor(user, pass){
        this.data = {
            session:undefined,
            main:'',
            classes:[]
        };
        this.user = user;
        this.pass = pass;
    }
    async login(){
        let data = new URLSearchParams({
            email:this.user,
            submit:'Log in',
            user_password:this.pass
        });
        let html = await fetch(endpoint.login,{
            method:'POST',
            headers:{
                'Content-Type' : 'application/x-www-form-urlencoded'
            },
            body:data
        }).then(response => {
            this.data.main = response.url;
            this.data.session = [];
            this.data.session = response.headers.raw();
            this.data.session['accept-encoding'] = 'gzip, deflate';
            this.data.session['session-id'] = this.data.session['set-cookie'][0].match(/session-id=([^;]+)/)[1];
            this.data.session['origin'] = endpoint;
            // console.log(this.data.session);
            return response.text();
        });
    }
    async getClass(index = undefined){
        if(this.data.session === undefined) await this.login();

        let hasil = [];
        if(index !== undefined && index < this.data.classes.length) return this.data.classes[index];
        if(this.data.classes.length) return this.data.classes;


        let html = await fetch(this.data.main,{
            headers:this.data.session
        }).then(response => response.text());
        await X(html,'.class',[{
            id:'.class_id',
            name:'.class_name',
            status:'.class_status',
            start:'.class_start_date',
            end:'.class_end_date',
            link:'.class_name a@href',
        }]).then(data => {
            for(let i in data){
                data[i].link = endpoint.base + data[i].link;
                data[i].assignment = [];
            }
            hasil= data;
            this.data.classes = data;
        });
        return hasil;
    }
    async getAssignment(classIndex = 0,index = undefined){
        if(this.data.session === undefined) await this.login();
        if(!this.data.classes.length) await this.getClass();

        let hasil = [];
        if(index !== undefined && index < this.data.classes[classIndex].assignment.length) return this.data.classes[classIndex].assignment[index];
        if(index === undefined && this.data.classes[classIndex].assignment.length) return this.data.classes[classIndex].assignment;
        let html = await fetch(this.data.classes[classIndex].link,{
            headers:this.data.session
        }).then(response => response.text());
        await X(html,'tbody',[{
            name:'.assgn-row@title',
            type:'.assgn-type',
            date:['.assgn-date'],
            link:'.assgn-inbox a@href'
        }]).then(data => {
            for(let i in data){
                data[i].link = endpoint.base + data[i].link;
                data[i].docs = [];

            }
            hasil= data;
            this.data.classes[classIndex].assignment = data;
        });
        return index === undefined?hasil:hasil[index];
    }
    async viewAssignment(classIndex = 0, assignmentIndex = 0, index = undefined){
        if(this.data.session === undefined) await this.login();
        if(!this.data.classes.length) await this.getClass();
        if(!this.data.classes[classIndex].length) await this.getAssignment(classIndex,assignmentIndex);

        let hasil = [];
        if(index !== undefined && index < this.data.classes[classIndex].assignment[assignmentIndex].docs.length) return this.data.classes[classIndex].assignment[assignmentIndex].docs[index];
        if(index === undefined && this.data.classes[classIndex].assignment[assignmentIndex].docs.length) return this.data.classes[classIndex].assignment[assignmentIndex].docs;

        let html = await fetch(this.data.classes[classIndex].assignment[assignmentIndex].link,{
            headers:this.data.session
        }).then(response => response.text());
        let getReferer = '';
        await X(html, 'a.matte_button@href').then(referer => {
            getReferer = endpoint.base + referer;
        });
        this.data.classes[classIndex].assignment[assignmentIndex].referer = getReferer;
        await X(html,'tr.student--1',[{
            id:'.pid',
            author:'.ibox_author',
            title:'.ibox_title',
            date:'.class_status',
            download:'a.dl_file@href',
            plagiarism:'.or-percentage',
            link:'a.or-link@onclick',
        }]).then(data => {
            for(let i in data){
                data[i].link = endpoint.base + (data[i].link.match(/\([^']*'([^']+)/)[1]);
                data[i].download = endpoint.base + (data[i].download.match(/\([^']*'([^']+)/)[1]).replace('download_format_select.asp','download_file.asp');
                data[i].title = data[i].title.replace('\n\t','').replace(/\s{2,}/g,' ');
            }
            hasil= data;
            this.data.classes[classIndex].assignment[assignmentIndex].docs = data;
        });
        return index === undefined?hasil:hasil[index];
    }
    async getReport(id){
        if(this.data.session === undefined) await this.login();

        let feed = await fetch(`https://ev.turnitin.com/app/carta/en_us/?lang=en_us&o=${id}`,{
            headers:this.data.session
        }).then(response => response.text());

        let html = await fetch(`https://www.turnitin.com/newreport_classic.asp?lang=en_us&oid=${id}&ft=1&bypass_cv=1`,{
            headers:this.data.session
        }).then(response => response.text());
        let hasil = [];
        await X(html,{
            processed :'li:nth-child(4)',
            id : 'li:nth-child(5)',
            word_count : 'li:nth-child(6)',
            submitted : 'li:nth-child(7)',
            title : 'h3 strong',
            author : 'h3 em',
            similarity_index : '.similarity_percent',
            internet_source : 'dd:nth-child(1)',
            publication : 'dd:nth-child(2)',
            student_papers : 'dd:nth-child(3)'
        }).then(data => {
            hasil = data;
        });
        let report = await fetch(`https://www.turnitin.com/newreport_printview.asp?d=1&lang=en_us`,{
            headers:this.data.session
        }).then(response => response.text());
        hasil.encodedText = base91.encode(report);
        return hasil;
    }
    async upload(filedir, opts, classIndex, assignmentIndex){
        if(this.data.session === undefined) await this.login();
        if(!this.data.classes.length) await this.getClass();
        if(!this.data.classes[classIndex].length) await this.viewAssignment(classIndex,assignmentIndex);

        let {title, author_first, author_last} = opts;
        let referer = this.data.classes[classIndex].assignment[assignmentIndex].referer;
        let session = this.data.session['session-id'];
        let newSession = new Headers(this.data.session);
        newSession.append('Referrer', referer);
        let data = new formdata();
        let fileData = fs.createReadStream(filedir);
        console.log('sending..'+`${referer}&session-id=${session}`);
        newSession.append('accept','application/json');
        newSession.append('origin', 'https://www.turnitin.com');
        newSession.append('host', 'www.turnitin.com');
        newSession.append('content-type',data.getHeaders());
        newSession.append('accept-encoding','gzip, deflate');
        let next = '';
        let uuid = '';
        let result = undefined;
        await request.post({
            url :  `${referer}&session-id=${session}`,
            headers: {
                'Accept' : 'application/json'
            },
            formData: {
                async_request:1,
                userID:'',
                author_first:author_first,
                author_last:author_last,
                title: title,
                userfile: fileData ,
                db_doc:'',
                dropbox_filename:'',
                google_doc:'',
                google_auth_uri:'',
                token:'',
                submit_via_panda:1,
                submit_button:'',
            }
        }, async function (error, response, body) {
            next = endpoint.base+response.toJSON().headers.location;
            uuid = response.toJSON().headers.location.match(/uuid=([^\&]+)/)[1];
            let up_status = false;
            while (!up_status){
                await fetch(`https://www.turnitin.com/panda/get_submission_metadata.asp?session-id=${session}&lang=en_us&skip_ready_check=1&uuid=${uuid}`,{
                    headers: newSession,
                }).then(response => response.json()).then(r => {
                    up_status = r.status;
                });
            }
            console.log('done_meta');
            console.log(newSession);
            const j = new request.jar();
            const set_cookie = newSession.get('cookie')[0].split('; ');
            for(let i in set_cookie)
                j.setCookie(set_cookie[i],'https://www.turnitin.com');
            console.log('confirming '+ `${next}&session-id=${session}&data-state=confirm`);
            await request.post({
                jar : j,
                url : `https://www.turnitin.com/submit_confirm.asp?lang=en_us&session-id=${session}&data-state=confirm&uuid=${uuid}`,
                headers: {
                    'X-Requested-With' : 'XMLHttpRequest',
                    'Accept' :'application/json',
                    'Origin' : 'https://www.turnitin.com',
                    'Referer' : referer,
                    'Host' : 'www.turnitin.com',
                    'session-id' : session,
                }
            }, async function(error, response, body) {
                result = JSON.parse(body);
            });
        });
        return result;
    }
}

module.exports.Turnitin = Turnitin;
