
async function check() {
    const deps = ['supertest', 'mongoose', 'express', './src/app.js'];
    for (const d of deps) {
        try {
            const mod = await import(d);
            console.log(`✅ Loaded: ${d}`);
            if (d === 'supertest') {
                console.log(`   Type of supertest: ${typeof mod.default || typeof mod}`);
            }
        } catch (e) {
            console.log(`❌ Failed: ${d}`);
            console.log(e.message);
        }
    }
}
check();
