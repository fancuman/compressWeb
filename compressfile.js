var fs = require('fs');
var path = require("path");
var minify = require('html-minifier').minify;
var UglifyJS = require("uglify-js");
var CleanCSS = require('clean-css');
var cssMinify = new CleanCSS();


const { extname } = require("path");
const { Command } = require('commander'); // (normal include)

const program = new Command();

program
    .description('compress a html file')
    .requiredOption('-i, --input <type>', 'input folder')
    .option("-d, --debug", "enable debug print");

program.parse();

const options = program.opts();

if (options.debug)
    console.log("src:" + options.input);


var list = [];
function listFile(dir) {
    var arr = fs.readdirSync(dir);
    arr.forEach(function (item) {
        var fullpath = path.join(dir, item);
        var stats = fs.statSync(fullpath);
        if (stats.isDirectory()) {
            listFile(fullpath);
        } else {
            list.push(fullpath);
        }
    });
    return list;
}


function compressFile(input, output) {
    fs.readFile(input, 'utf8', function (err, data) {
        if (err) {
            throw err;
        }
        fs.writeFile(output, minify(data, { removeComments: true, collapseWhitespace: true, minifyJS: true, minifyCSS: true }), function () {
            if (options.debug)
                console.log('compress ' + input + ' success');
        });
    });
}


configUglifyJS = {
    mangle: true,
    compress: {
        sequences: true,
        dead_code: true,
        conditionals: true,
        booleans: true,
        unused: true,
        if_return: true,
        join_vars: true,
        drop_console: true
    }
};

function compressJsFile(input, output) {
    fs.readFile(input, 'utf8', function (err, data) {
        if (err) {
            throw err;
        }
        var result = UglifyJS.minify(data, configUglifyJS);
        fs.writeFile(output, result.code, function () {
            if (options.debug)
                console.log('compress ' + input + ' success');
        });
    });
}

function compressCssFile(input, output) {
    fs.readFile(input, 'utf8', function (err, data) {
        if (err) {
            throw err;
        }
        var result = cssMinify.minify(data);
        fs.writeFile(output, result.styles, function () {
            if (options.debug)
                console.log('compress ' + input + ' success');
        });
    });
}

var res = listFile(options.input);


res.forEach(file => {
    if ((extname(file) == '.htm') || (extname(file) == '.html')) {
        if (options.debug)
            console.log('compress html:' + file)
        compressFile(file, file)
    } else if (extname(file) == '.js') {
        if (options.debug)
            console.log('compress js:' + file)
        compressJsFile(file, file)
    } else if (extname(file) == '.css') {
        if (options.debug)
            console.log('compress css:' + file)
        compressCssFile(file, file)
    }
})
