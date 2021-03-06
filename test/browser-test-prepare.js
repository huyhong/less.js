var path = require('path'),
    fs = require('fs');

var readDirFilesSync = function(dir, regex, callback) {
    fs.readdirSync(dir).forEach(function (file) {
        if (! regex.test(file)) { return; }
        callback(file);
    });
};

var createTestRunnerPage = function(dir, exclude, testSuiteName, dir2) {
    var output = '<html><head>\n';

    readDirFilesSync(path.join("test", dir, 'less', dir2 || ""), /\.less$/, function (file) {
        var name = path.basename(file, '.less'),
            id = (dir ? dir + '-' : "") + 'less-' + (dir2 ? dir2 + "-" : "") + name;

        if (exclude && name.match(exclude)) { return; }

        output += '<link id="original-less:' + id + '" rel="stylesheet/less" type="text/css" href="/' + path.join(dir, 'less', dir2 || "", name) + '.less' +'">\n';
        output += '<link id="expected-less:' + id + '" rel="stylesheet"  type="text/css" href="/' + path.join(dir, 'css', dir2 || "", name) + '.css' + '">\n';
    });

    output += String(fs.readFileSync(path.join('test/browser', 'template.htm'))).replace("{runner-name}", testSuiteName);

    fs.writeFileSync(path.join('test/browser', 'test-runner-'+testSuiteName+'.htm'), output);
};

var removeFiles = function(dir, regex) {
    readDirFilesSync(dir, regex, function(file) {
        fs.unlinkSync(path.join(dir, file), function() {
            console.log("Failed to delete " + file);
        });
    });
};

removeFiles("test/browser", /test-runner-[a-zA-Z-]*\.htm$/);
createTestRunnerPage("", /javascript|urls/, "main");
createTestRunnerPage("", null, "legacy", "legacy");
createTestRunnerPage("", /javascript/, "errors", "errors");
createTestRunnerPage("", null, "no-js-errors", "no-js-errors");
createTestRunnerPage("browser", null, "browser");
createTestRunnerPage("browser", null, "relative-urls", "relative-urls");
createTestRunnerPage("browser", null, "rootpath", "rootpath");
createTestRunnerPage("browser", null, "rootpath-relative", "rootpath-relative");
createTestRunnerPage("browser", null, "production");
createTestRunnerPage("browser", null, "modify-vars", "modify-vars");
