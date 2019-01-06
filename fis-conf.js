fis.set('project.ignore', fis.get('project.ignore').concat(['test/**', 'output/*', '*.d.ts', '*.json', '*.md', 'LICENSE']));


fis.match('output/*', {
    release: false
});

fis.match('node_modules/**.js', {
    isMod: true,
});

fis.match('(**).{ts,tsx}', {
    rExt: '.js',
    moduleId: 'output$1',
    isMod: true,
    parser: fis.plugin('typescript', {
        // module: 2,
        jsxFactory: 'h',
        allowSyntheticDefaultImports: true
    })
});

fis.match('(**vue-*).js', {
    moduleId: 'output$1'
});

fis.match('(**vue.*).js', {
    moduleId: 'vue'
});


fis.unhook('components');
fis.hook('amd', {
    extList: ['.js', '.jsx', '.ts', '.tsx'],
});


fis.hook('node_modules');

fis.match('highlights/index.html', {
    release: 'index.html',
});

fis.match('*', {
    deploy: fis.plugin('local-deliver', {
        to: './output'
    })
});
