fis.set('project.ignore', fis.get('project.ignore').concat(['test/**', '*.d.ts', '*.json', 'LICENSE']));

fis.match('*.ts', {
    rExt: '.js',
    parser: fis.plugin('typescript', {
        module: 2
    })
});
fis.match('highlights/index.html', {
    release: 'index.html'
});

fis.match('*', {
    deploy: fis.plugin('local-deliver', {
        to: './output'
    })
});
