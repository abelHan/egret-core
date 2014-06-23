var path = require("path");
var libs = require("../core/normal_libs");
var param = require("../core/params_analyze.js");
var fs = require("fs");
var async = require('../core/async');
var compiler = require("./compile.js")
var create_file_list = require("./create_file_list.js");
var FileUtil = require("../core/file_util.js");
/**
 * 创建新项目
 * @param currentDir 当前文件夹
 * @param args
 * @param opts
 */
function run(currDir, args, opts) {
    var projectName = args[0];
    if (!projectName) {
        libs.exit(1001);
    }

    var runtime = param.getOption(opts, "--runtime", ["html5", "native"]);
    var egret_file = path.join(currDir, projectName, "bin-debug/lib/egret_file_list.js");

    async.series([

        function (callback) {
            libs.log("正在创建新项目文件夹...");
            createNewProject(projectName);
            callback();
        },

        function (callback) {

            libs.log ("正在生成egret_file_list...");
            compiler.generateEgretFileList(callback, egret_file, runtime);

        },

        function (callback) {
            libs.log("正在编译egret...");
            compiler.compile(callback,
                path.join(param.getEgretPath(), "src"),
                path.join(currDir, projectName, "bin-debug/lib"),
                egret_file
            );
        },


        function (callback) {
            libs.log ("正在导出 egret.d.ts...");
            compiler.exportHeader(callback,
                path.join(param.getEgretPath(), "src"),
                path.join(currDir, projectName, "src", "egret.d.ts"),
                egret_file
            );

        },

        function (callback) {
            var gameListPath = currDir+"/"+projectName+"/bin-debug/src/game_file_list.js";
            var srcPath = currDir+"/"+projectName+"/src/";
            var list = FileUtil.searchByExtension(srcPath,"ts");
            var gameListText = create_file_list.create(list,srcPath);
            FileUtil.save(gameListPath,gameListText,"utf-8");
            compiler.compile(callback,
                path.join(currDir, projectName, "src"),
                path.join(currDir, projectName, "bin-debug/src"),
                gameListPath
            );
        },

        function (callback) {
            libs.log("创建成功");
        }
    ])


}

//创建 游戏目录
function createNewProject(projectName) {
    var template = path.join(param.getEgretPath(), "tools/templates/game");
    var projPath = path.join(process.cwd(), projectName);
    FileUtil.copy(template, projPath);
}

function help_title() {
    return "创建新项目";
}


function help_example() {
    return "egret create [project_name] [--runtime html5|native]";
}

exports.run = run;
exports.help_title = help_title;
exports.help_example = help_example;