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
            acc[name].categories = val[1];
            break;
        case 'X-GENDER':
            acc[name].gender = val[1];
            break;
    }
    return acc;

}

fs.readFile("/home/thiago/Downloads/converter/contacts.vcf", "utf8", function (err, data) {
    if (err) throw err;

    let name = '';
    let objs = data
        .split(/\r\n/)
        .map(line => line.split(":"))
        .reduce(convertFromVcfToJSON, {});
    ;
    console.log("----------------------------------");
    console.log(JSON.stringify(objs, null, 2));
});
