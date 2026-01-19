from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    # Mobile viewport
    page = browser.new_page(viewport={'width': 390, 'height': 844})

    page.goto('http://localhost:3000/worlds/one-piece-1/whitebeard-unisex-hoodie')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)

    page.screenshot(path='E:/doqendev/dirava_new/mobile_product.png', full_page=True)
    print("Mobile screenshot saved")

    body_width = page.evaluate('document.body.scrollWidth')
    viewport_width = page.evaluate('window.innerWidth')
    print(f"Body width: {body_width}, Viewport: {viewport_width}")

    if body_width > viewport_width:
        print(f"OVERFLOW: {body_width - viewport_width}px")

        overflowing = page.evaluate('''() => {
            const results = [];
            const vw = window.innerWidth;
            document.querySelectorAll('*').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.right > vw + 2) {
                    results.push({
                        tag: el.tagName,
                        classes: el.className.toString().substring(0, 100),
                        width: Math.round(rect.width),
                        right: Math.round(rect.right),
                        overflow: Math.round(rect.right - vw)
                    });
                }
            });
            return results.slice(0, 30);
        }''')

        print("\nOverflowing elements:")
        for el in overflowing:
            print(f"  {el['tag']}.{el['classes'][:60]}")
            print(f"    width:{el['width']}px right:{el['right']}px overflow:{el['overflow']}px")

    browser.close()
