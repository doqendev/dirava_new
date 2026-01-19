from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    # Capture console messages
    console_messages = []
    page.on('console', lambda msg: console_messages.append(f"{msg.type}: {msg.text}"))

    print("=== CART FUNCTIONALITY TEST ===\n")

    # 1. Go to product page
    print("1. Navigating to product page...")
    page.goto('http://localhost:3000/worlds/one-piece-1/whitebeard-unisex-hoodie')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)
    print("   Product page loaded")

    # 2. Click Add to Cart
    print("\n2. Clicking Add to Cart...")
    add_to_cart_btn = page.locator('button:has-text("ADD TO CART")')
    if add_to_cart_btn.count() > 0:
        add_to_cart_btn.click()
        # Wait longer for the API request
        page.wait_for_timeout(5000)
        print("   Add to Cart clicked, waited 5s")
    else:
        print("   ERROR: Add to Cart button not found")

    # Take screenshot
    page.screenshot(path='E:/doqendev/dirava_new/cart_test.png')

    # 3. Print console messages
    print("\n3. Console messages:")
    for msg in console_messages:
        if 'error' in msg.lower() or 'fail' in msg.lower():
            print(f"   [ERROR] {msg[:200]}")
        elif 'warn' in msg.lower():
            print(f"   [WARN] {msg[:200]}")

    # 4. Check button state
    print("\n4. Checking button state...")
    button_text = page.locator('button:has-text("ADD"), button:has-text("ADDING"), button:has-text("ADDED")').first.inner_text()
    print(f"   Button shows: {button_text}")

    # 5. Check if cart drawer opened
    print("\n5. Checking for cart drawer...")
    # Try clicking cart icon in header
    cart_btn = page.locator('header button').last
    if cart_btn:
        cart_btn.click()
        page.wait_for_timeout(1000)
        page.screenshot(path='E:/doqendev/dirava_new/cart_drawer_test.png')
        print("   Clicked cart button, screenshot saved")

    browser.close()
