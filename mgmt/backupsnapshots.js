const moment = require('moment')
const fs = require('fs');
const crypto = require('crypto');
var logger;
var db;

module.exports = (config,db_) => {
    logger = require('../mgmt/logger')(config);
    db = db_;
    return {
        run: () => {
            BackupTrackerDAO.init(config);
            setInterval(runBackupspanshot, config.backup_setup.backupCheckInterval,config);
        }
    };
}

function runBackupspanshot (config) {
    var today = moment();
    if(BackupTrackerDAO.values().lastBackupCheckDate === null ||
        !BackupTrackerDAO.values().lastBackupCheckDate.isSame(today, 'day'))
    {
        logger.info("" + moment().format() + " Check if backup required" );
        // Backupcheck has not being done today.

        // Compact the NEDB file and then run digest.
        db.on('compaction.done', function () {
           db.removeAllListeners('compaction.done');   // Tidy up for next tests

            makeDigestForFile(config.data_file, (digestCurrentDataFile) => {

                // logger.debug("digests,current : " + digestCurrentDataFile + " last: " + BackupTrackerDAO.values().lastBackupDigest )

                if(BackupTrackerDAO.values().lastBackupSlot === null ||
                digestCurrentDataFile !== BackupTrackerDAO.values().lastBackupDigest)
                {
                    newSlot = calcNextSlot(config.backup_setup.maxSlots, BackupTrackerDAO.values().lastBackupSlot);
                    takeSnapshot(config.data_file, digestCurrentDataFile, newSlot, today, config);
                    BackupTrackerDAO.values().lastBackupSlot = newSlot;
                    BackupTrackerDAO.values().lastBackupDigest = digestCurrentDataFile;
                    BackupTrackerDAO.values().lastBackupDate = today;

                    logger.info("" + moment().format() + " Backup in progress " + BackupTrackerDAO.toString() );
                }
                BackupTrackerDAO.values().lastBackupCheckDate = today;
                BackupTrackerDAO.save();
            });
        });
        db.persistence.compactDatafile();
    }
}

function makeDigestForFile(filePath, callback) {
    var input = fs.createReadStream(filePath);

    // the file you want to get the hash
    var hash = crypto.createHash('sha1');
    hash.setEncoding('hex');
    input.on('end', () => {
        hash.end();
        var digest = hash.read();
        // logger.debug("Digest is: " + digest);
        callback(digest);
    });
    input.pipe(hash);
}

function takeSnapshot(datafile, digestCurrentDataFile, nextSlot, today,config) {
    var slot = "" + nextSlot;
    // We want the saved files to ordered by slot number so need to preprend with
    // leading 0s, e.g slot-001, slot-002, etc.
    slot = (nextSlot < 100) ? "0" + slot : slot;
    slot = (nextSlot < 10) ? "0" + slot : slot;
    var backupDir = getBackupDir(config);
    var newFilename = backupDir + "/slot-" + nextSlot + "-" + today.format("YYYY.MM.DD") + ".db";
    // logger.debug("Creating file; " + newFilename);
    fs.createReadStream(datafile).pipe(fs.createWriteStream(newFilename));
}

function getBackupDir(config) {
    var backupDir = config.backup_setup.backupDir;
    if (fs.existsSync(backupDir) === false) {
        fs.mkdirSync(backupDir);
        logger.info("backdir created: " + backupDir);
    }
    return backupDir;
}

function calcNextSlot(maxSlots, lastBackupSlot) {
    var nextSlot;
    if (!lastBackupSlot) {
        nextSlot = 1;
    } else {
        nextSlot = lastBackupSlot + 1;
        if (nextSlot > maxSlots) {
            nextSlot = 1;
        }
    }
    return nextSlot;
}


// FOllows pattern defined here: https://scotch.io/bar-talk/4-javascript-design-patterns-you-should-know
var BackupTrackerDAO = (function (config) {
    var fPath;
    var v; // {lastBackupCheckDate, lastBackupDate, lastBackupDigest, lastBackupSlot}

    function convertStringToDate(dateStr) {
        var milliseconds = Date.parse(dateStr);
        return new Date(milliseconds);
    }
    function load() {
        if (fs.existsSync(fPath)) {
            v = JSON.parse(fs.readFileSync(fPath));
            v.lastBackupCheckDate = moment(convertStringToDate(v.lastBackupCheckDate));
            v.lastBackupDate = moment(convertStringToDate(v.lastBackupDate));
        } else {
            v = {
                lastBackupCheckDate:null,
                lastBackupDate:null,
                lastBackupDigest:null,
                lastBackupSlot:null
            }
        }
    }
    var o = {
        values : () => {return v},
        init : (config) => {
            fPath = "" + config.backup_setup.backupDir + "/backuptracker.json";
            load();
        },
        save : () => {
            fs.writeFileSync(fPath,JSON.stringify(v));
        },
        toString : () =>   {
            return "Check Date: " + moment(v.lastBackupCheckDate).format() +
                   " Backup Date: " + moment(v.lastBackupDate).format() +
                   " Digest: " + v.lastBackupDigest +
                   " Slot: " + v.lastBackupSlot;
        }
    };
    return o;
})();



