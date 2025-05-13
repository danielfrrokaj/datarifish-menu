# Datarifish Menu System

A multilingual fish restaurant menu system with an admin panel for easy content management.

## Features

- Multilingual support (English, Italian, Albanian)
- Beautiful, responsive design with animations
- Category-based menu organization
- Admin panel for managing menu items and categories
- Prices in Albanian Lek (ALL)
- High-quality SVG country flags using flag-icons library

## Setup

1. Clone the repository
2. Place your menu item images in the `assets/images` directory
3. No additional setup needed for flags - using flag-icons library

## Usage

### Customer Menu

1. Open `index.html` in a web browser
2. Select your preferred language
3. Browse categories and menu items
4. Enjoy the smooth animations and beautiful design

### Admin Panel

1. Open `admin.html` in a web browser
2. Login with the default password: `admin123`
3. Manage categories and menu items:
   - Add, edit, or delete categories
   - Add, edit, or delete menu items
   - Set prices in ALL
   - Add multilingual content

## File Structure

```
datarifish-menu/
├── index.html           # Customer-facing menu
├── admin.html          # Admin panel
├── css/
│   ├── style.css      # Main styles
│   └── admin.css      # Admin panel styles
├── js/
│   ├── main.js        # Menu functionality
│   └── admin.js       # Admin panel functionality
└── assets/
    └── images/        # Menu item images
```

## Dependencies

- Font Awesome 6.0.0 for icons
- flag-icons 6.11.0 for country flags

## Customization

### Colors

The color scheme can be modified in `css/style.css`. The current theme uses:
- Primary Blue: #1e3d59
- Light Blue: #3498db
- Accent Blue: #17a2b8
- White: #ffffff

### Categories

Default categories include:
- Starters
- Main Courses
- Seafood
- Desserts

You can add or modify categories through the admin panel.

## Security Note

This is a demo version using localStorage for data storage and a simple password for admin access. For production use, implement proper server-side authentication and database storage. 