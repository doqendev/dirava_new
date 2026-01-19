from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 390, 'height': 844})

    page.goto('http://localhost:3000/worlds/one-piece-1/whitebeard-unisex-hoodie')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)

    page.screenshot(path='E:/doqendev/dirava_new/mobile_description.png', full_page=True)
    print("Mobile screenshot saved")

    browser.close()
