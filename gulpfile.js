const path = require('path');
const gulp = require('gulp');
const del = require('del');
const runner = require('run-sequence');
const sourcemaps = require('gulp-sourcemaps');
const tslint = require('gulp-tslint');
const ts = require('gulp-typescript');
const ava = require('gulp-ava');
let tsProject = ts.createProject('tsconfig.json');

gulp.task('prebuild', () => {
    tsProject = ts.createProject('tsconfig.json');
    tsProject.config.include.pop();
});

gulp.task('pretest', cb => {
    tsProject = ts.createProject('tsconfig.json');
    runner('clean:dist', ['tslint', 'transpiler'], cb);
});

gulp.task('preproduct', cb => {
    tsProject = ts.createProject('tsconfig.json', { rootDir: "src" });
    tsProject.config.include.pop();
    runner('clean:dist', ['tslint', 'transpiler'], cb);
});

gulp.task('clean:dist', () => del(['dist/**/*']));

gulp.task('tslint', () => {
    return tsProject.src()
        .pipe(tslint({ formatter: "verbose" }))
        .pipe(tslint.report({ emitError: false }));
});

// gulp.task('copy:public', () => {
//     const dest = tsProject.options.rootDir.endsWith("src") ? "dist/public" : "dist/src/public";
//     console.log(dest);
//     return gulp.src(["src/public/**/*"])
//         .pipe(gulp.dest(dest));
// })

gulp.task('transpiler', () => {
    const sourceRootPostfix = tsProject.options.rootDir.endsWith("src") ? "src" : "";
    const outDir = tsProject.config.compilerOptions.outDir || "dist";
    return tsProject.src() //gulp.src(['./src/**/*.ts', './typings/**/*.d.ts'], { base: './src' })
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(sourcemaps.write('./', {
            includeContent: false,
            sourceRoot:"../"
        }))
        .pipe(gulp.dest(outDir));
});

gulp.task('build', ['prebuild', 'clean:dist'], () => {
    runner(['tslint', 'transpiler']);
});

gulp.task('watch', ['build'], () => {
    gulp.watch('./src/**/*.ts', ['transpiler']);
});

gulp.task('test', ['pretest'], () => {
    return gulp.src('dist/test/**/*.spec.js')
        .pipe(ava({ nyc: true }));
})

gulp.task('product', ['preproduct'], () => {
    return gulp.src(["package.json"]).pipe(gulp.dest('dist'));
});
