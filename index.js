#!/usr/bin/env node
'use strict';

const glob = require('glob-all');
const validate = require('serverless/lib/plugins/aws/lib/validate');
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');


class Package {
    constructor(serverless, options) {
        this.serverless = serverless
        this.options = options

        Object.assign(this, validate)

        this.commands = {
            'package': {
                lifecycleEvents: [
                    'package'
                ]
            }
        }

        this.hooks = {
            'before:package:package': () => Promise.resolve().then(this.validate.bind(this)),
            'package:package': () => new Promise(this.packageFiles.bind(this)),
            'deploy:createDeploymentArtifacts': () => new Promise(this.packageFiles.bind(this)),
        }
    }

    packageFiles(resolve, reject) {
        const config = this.serverless.service;

        if(!config.package.artifact) { reject('package.artifact not defined'); }

        this.serverless.cli.log('Packaging service...');

        const output = fs.createWriteStream(config.package.artifact);
        output.on('open', () => {
            const archive = archiver('zip', {zlib: {level: 9, memLevel: 9}});
            archive.pipe(output)

            for(let root in config.custom.package.sources) {
                let fileList = glob.sync(config.custom.package.sources[root], {cwd: root});
                for(let fileName of fileList) {
                    const fullPath = path.join(root, fileName);
                    this.serverless.cli.log(fullPath + ' -> ' + fileName);
                    const stats = fs.statSync(fullPath);
                    if(!stats.isDirectory(fullPath)) {
                        archive.append(fs.createReadStream(fullPath), {
                            name: fileName,
                            mode: stats.mode
                        });
                    }
                }
            }
            archive.finalize();
            resolve();
        });
    }

}

module.exports = Package;
