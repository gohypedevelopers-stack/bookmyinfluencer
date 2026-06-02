import http from 'https';

const BRAND_IMAGE_CANDIDATES: Record<string, string[]> = {
    nike: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80', // Red athletic sneaker
        'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&auto=format&fit=crop&q=80', // Running/Athletic outdoors
        'https://images.unsplash.com/photo-1502904582680-2495a047683b?w=500&auto=format&fit=crop&q=80'  // Running/Fitness
    ],
    air: [
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&auto=format&fit=crop&q=80', // Sleek airplane wing in clean blue sky
        'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=500&auto=format&fit=crop&q=80', // Clean breeze/clouds
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&auto=format&fit=crop&q=80'  // Open clean landscape/sky
    ],
    oppo: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80', // Sleek mobile phone on minimalist table
        'https://images.unsplash.com/photo-1565849906660-af4ee3d74a1f?w=500&auto=format&fit=crop&q=80', // Modern smartphone back view
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&auto=format&fit=crop&q=80'  // Smartphone close up
    ],
    vivo: [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80', // Blue modern smartphone camera back view
        'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=500&auto=format&fit=crop&q=80', // Sleek smartphone lens close-up
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80'  // Clean tech desk setup
    ],
    boat: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80', // Premium headphones on vibrant background
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80', // Minimalist wireless headphones
        'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=500&auto=format&fit=crop&q=80'  // Stylish audio/music gear
    ]
};

async function checkUrl(url: string): Promise<number> {
    return new Promise((resolve) => {
        const req = http.request(url, { method: 'HEAD' }, (res) => {
            resolve(res.statusCode || 0);
        });
        req.on('error', () => resolve(0));
        req.end();
    });
}

async function main() {
    console.log("Testing brand image candidates...");
    for (const [brand, urls] of Object.entries(BRAND_IMAGE_CANDIDATES)) {
        console.log(`\nTesting candidates for: ${brand.toUpperCase()}`);
        for (const url of urls) {
            const status = await checkUrl(url);
            if (status === 200) {
                console.log(`  ✅ OK: ${url}`);
            } else {
                console.log(`  ❌ BROKEN: ${url} (Status: ${status})`);
            }
        }
    }
}

main().catch(console.error);
