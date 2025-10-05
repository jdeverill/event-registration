# PDL Registration App

A modern React application for PDL (Pickleball) registration with Google Sheets integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Google account for Apps Script setup

### 1. Clone and Setup
```bash
# Navigate to your project directory
cd pdl-registration-app

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 2. Configure Google Apps Script
1. Go to [script.google.com](https://script.google.com)
2. Create a new project
3. Replace the default code with the provided Google Apps Script code
4. Update the CONFIG object with your Google Sheets IDs
5. Deploy as a web app with "Anyone" access
6. Copy the deployment URL

### 3. Update Environment Variables
Edit `.env` file:
```bash
REACT_APP_GAS_URL=https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID/exec
```

### 4. Run the Application
```bash
# Start development server
npm start

# Open http://localhost:3000
```

## 📁 Project Structure

```
pdl-registration-app/
├── public/
│   └── index.html          # HTML template with Tailwind CSS
├── src/
│   ├── App.tsx            # Main application component
│   ├── index.tsx          # React entry point
│   └── index.css          # Global styles
├── .env                   # Environment variables
├── .env.example           # Environment template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## 🎯 Features

- ✅ **Member Validation** - Autocomplete with valid member names
- ✅ **Email Verification** - 6-digit code verification system
- ✅ **Registration Tracking** - Real-time count and waiting list
- ✅ **Duplicate Prevention** - Prevents double registrations
- ✅ **Responsive Design** - Works on mobile and desktop
- ✅ **Form Validation** - Real-time validation with error messages
- ✅ **Loading States** - User feedback during API calls
- ✅ **Error Handling** - Graceful error recovery

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject (not recommended)
npm run eject
```

### Testing Without Google Sheets
The app includes fallback sample data, so you can test the UI even without configuring Google Sheets:
- Sample members: John Smith, Jane Doe, Mike Johnson, Sarah Wilson, David Brown
- Email verification works with any 6-digit code
- Form validation and UI interactions work fully

## 🔧 Configuration

### Environment Variables
- `REACT_APP_GAS_URL` - Google Apps Script web app URL (required)
- `REACT_APP_MEMBERS_GAS_URL` - Optional separate URL for members data

### Google Sheets Setup
1. **Registration Sheet**: Stores all registration data
2. **Members Sheet**: Contains valid member names in column A

### Google Apps Script Configuration
Update the CONFIG object in your Apps Script:
```javascript
const CONFIG = {
  REGISTRATION_SHEET_ID: 'your_registration_sheet_id',
  MEMBERS_SHEET_ID: 'your_members_sheet_id',
  MAX_REGISTRATIONS: 50,
  // ... other settings
};
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options

**Option 1: Netlify**
1. Build the app: `npm run build`
2. Drag the `build` folder to [netlify.com](https://netlify.com)
3. Set environment variables in Netlify dashboard

**Option 2: Vercel**
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`
3. Set environment variables in Vercel dashboard

**Option 3: GitHub Pages**
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add deploy script to package.json
3. Run: `npm run deploy`

## 🔍 Troubleshooting

### Common Issues

**"API URL not configured" Error**
- Solution: Update `.env` file with your actual Google Apps Script URL

**CORS Errors**
- Solution: Ensure your Google Apps Script is deployed as "Web app" with "Anyone" access

**Members Not Loading**
- Solution: Check your Members sheet has data in column A
- Verify MEMBERS_SHEET_ID in Apps Script CONFIG

**Email Verification Not Working**
- Check Gmail spam folder
- Verify email format is valid
- Gmail API is enabled by default in Apps Script

**Build Errors**
- Delete `node_modules` and run `npm install` again
- Check Node.js version (requires 16+)

### Debug Steps
1. Check browser console for errors
2. Verify environment variables are loaded
3. Test Google Apps Script functions individually
4. Check Google Apps Script execution logs

## 📊 Google Sheets Structure

### Registration Sheet
| Column | Header | Description |
|--------|--------|-------------|
| A | Player Name | Full name |
| B | Email | Email address |
| C | Division | Selected division/night |
| D | Wall Preference | Left/Right/Either |
| E | Comments | Optional comments |
| F | Registration Time | Timestamp |
| G | Registration Number | Sequential number |
| H | Waiting List | Yes/No |

### Members Sheet
| Column | Header | Description |
|--------|--------|-------------|
| A | Member Name | Valid member names |

## 🎨 Customization

### Styling
- Uses Tailwind CSS (loaded via CDN in index.html)
- Custom styles in `src/index.css`
- Responsive design with mobile-first approach

### Form Options
Edit divisions and wall options in `App.tsx`:
```typescript
const divisions = [
  'Pos.1-Wednesdays',
  'Pos.2-Wednesdays', 
  // Add your divisions here
];

const wallOptions = ['Left Wall', 'Right Wall', 'Either Wall'];
```

### Registration Limits
Update in Google Apps Script CONFIG:
```javascript
MAX_REGISTRATIONS: 50  // Change this number
```

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check this README for common solutions
2. Review Google Apps Script execution logs
3. Check browser console for errors
4. Verify Google Sheets permissions and structure

---

**Happy registering! 🏓**