#!/usr/bin/env node

let fs = require('fs');

function convertFromVcfToJSON(acc, val) {
    let header = val[0].split(';');

    switch (header[0]) {
        case 'FN':
            name = val[1];
            acc[name] = acc[name] || {};
            break;
        case "TEL":
            let phones = header[1].split("=");
            acc[name].phone = acc[name].phone || {};
            switch (phones[1]) {
                case 'CELL':
                    acc[name].phone.mobile = acc[name].phone.mobile || [];
                    acc[name].phone.mobile.push(val[1]);
                    break;
                case 'WORK':
                    acc[name].phone.work = acc[name].phone.work || [];
                    acc[name].phone.work.push(val[1]);
                    break;
                case 'HOME':
                    acc[name].phone.home = acc[name].phone.home || [];
                    acc[name].phone.home.push(val[1]);
                    break;
                default:
                    acc[name].phone.other = acc[name].phone.other || [];
                    acc[name].phone.other = val[1];
                    break;
            }
            break;
        case 'BDAY':
            acc[name].birthday = val[1];
            break;
        case 'NOTE':
            val[1] = val[1].replace(/\\n/g, ": ");
            acc[name].note = val[1];
            break;
        case 'EMAIL':
            let emails = header[1].split("=");
            acc[name].email = acc[name].email || {};
            switch (emails[1]) {
                case 'WORK':
                    acc[name].email.work = acc[name].email.work || [];
                    acc[name].email.work.push(val[1]);
                    break;
                case 'HOME':
                    acc[name].email.home = acc[name].email.home || [];
                    acc[name].email.home.push(val[1]);
                    break;
                default:
                    acc[name].email.other = acc[name].email.other || [];
                    acc[name].email.other.push(val[1]);
                    break;
            }
            break;
        case 'ADR':
            let addrs = header[1].split("=");
            acc[name].addr = acc[name].addr || {};
            val[1] = val[1].replace(/;/g, "").replace(/\\n/g, ", ");
            switch (addrs[1]) {
                case 'WORK':
                    acc[name].addr.work = acc[name].addr.work || [];
                    acc[name].addr.work.push(val[1]);
                    break;
                case 'HOME':
                    acc[name].addr.home = acc[name].addr.home || [];
                    acc[name].addr.home.push(val[1]);
                    break;
                default:
                    acc[name].addr.other = acc[name].addr.other || [];
                    acc[name].addr.other.push(val[1]);
                    break;
            }
            break;
        case 'TITLE':
            acc[name].title = val[1];
            break;
        case 'CATEGORIES':
            acc[name].categories = acc[name].categories || [];
            acc[name].categories.push(val[1]);
            break;
        case 'NICKNAME':
            acc[name].nickname = val[1];
            break;
        case 'X-GENDER':
            acc[name].gender = val[1];
            break;
    }
    return acc;
}

// address=Endereco bla
// address2=Endereco 2 bla
// city=Cidade
// state=Estado
// zip=CEP
// country=Pais
// url=URL
// groups=grupo1,grupo2

function convertToAbook(json) {
    let idx = 0;
    let output = "\n[format]\nprogram=abook\nversion=0.6.1\n";
    for (const contact in json) {
        ++idx;
        output += "\n[" + idx + "]\n";
        output += "name=" + contact + "\n";
        if (json[contact].nickname)
            output += "nick=" + json[contact].nickname + "\n";
        if (json[contact].title)
            output += "custom1=" + json[contact].title + "\n";
        if (json[contact].birthday)
            output += "anniversary=" + json[contact].birthday + "\n";
        if (json[contact].gender)
            output += "custom2=" + json[contact].gender + "\n";
        if (json[contact].groups) {
            output += "groups=";
            json[contact].groups.forEach(group => { output += group + "," });
            output += "\n";
        }
        if (json[contact].email) {
            output+="email=";
            if (json[contact].email.home) {
                json[contact].email.home.forEach(email => {output += email
                        + ",";});
                output = output.slice(0, -1);
                output+="\n";
            }
            if (json[contact].email.work) {
                json[contact].email.work.forEach(email => {output += email
                        + ",";});
                output = output.slice(0, -1);
                output+="\n";
            }
            if (json[contact].email.other) {
                json[contact].email.other.forEach(email => {output += email
                        + ",";});
                output = output.slice(0, -1);
                output+="\n";
            }
        }
        if (json[contact].phone) {
            if (json[contact].phone.home) {
                output += "phone=";
                json[contact].phone.home.forEach(phone => { output += phone
                        + "," });
                output = output.slice(0, -1);
                output+="\n";
            }
            if (json[contact].phone.work) {
                output += "workphone=";
                json[contact].phone.work.forEach(phone => { output += phone
                        + "," });
                output = output.slice(0, -1);
                output+="\n";
            }
            if (json[contact].phone.mobile) {
                output += "mobile=";
                json[contact].phone.mobile.forEach( phone => { output += phone
                        + "," } );
                output = output.slice(0, -1);
                output+="\n";
            }
            if (json[contact].phone.other) {
                output += "fax=";
                json[contact].phone.other.forEach( phone => { output += phone
                        + "," } );
                output = output.slice(0, -1);
                output+="\n";
            }
        }
        if (json[contact].note)
            output += "notes=" + json[contact].note + "\n";
    }

    console.log(output);

}

function convertFromJsonTo(extension, jsonData) {
    switch (extension) {
        case 'ABOOK':
            convertToAbook(jsonData);
            break;
        default:
            console.log("I don't really know how to convert a " + extension
            + " file :(.");
            break;
    }
}

if (process.argv.length <= 2) {
    console.log("usage: vfcConvertes.js file.vfc > output");
} else {
    let ipt_file_name = process.argv[2];
    fs.readFile(ipt_file_name, "utf8", function (err, data) {
        if (err) {
            console.log("File not found");
            return;
        } else {
            let name = '';
            let objs = data
                .split(/\r\n/)
                .map(line => line.split(":"))
                .reduce(convertFromVcfToJSON, {});
            ;
            convertFromJsonTo('ABOOK', objs)
        }
    });
}
