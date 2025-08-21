const { execSync } = require('child_process');

try {
    console.log('🧪 Iniciando testes Jest...\n');
    
    // Executar Jest
    const result = execSync('npx jest --verbose --detectOpenHandles --forceExit', {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: 'inherit'
    });
    
    console.log('\n✅ Testes concluídos com sucesso!');
} catch (error) {
    console.error('❌ Erro ao executar testes:', error.message);
    process.exit(1);
}
