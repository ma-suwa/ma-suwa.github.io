// gulpプラグインの読みこみ
var gulp = require("gulp");

// browser-syncのプラグインの読み込み
var browserSync = require("browser-sync");

// タスクの設定
gulp.task("browserSyncTask", function () {
    browserSync({
        server: {
            baseDir: "project" // ルートとなるディレクトリを指定
            ,index  : "soundVisualize.html"
        }
    });

    // srcフォルダ以下のファイルを監視
    gulp.watch("browserSync", function() {
        browserSync.reload();   // ファイルに変更があれば同期しているブラウザをリロード
    });
});
