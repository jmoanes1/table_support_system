# Table Support Management System

A comprehensive table management system built with React for managing customer orders across 15 tables in a restaurant/bar environment.

## 🚀 Features

### 🔐 Authentication
- Simple admin login system (no backend required)
- Session management with localStorage
- Secure logout functionality

### 📊 Dashboard
- Real-time statistics display
- 15 table cards with live status updates
- Color-coded payment status indicators
- Responsive grid layout

### 🧾 Table Management
- **Create:** Add new customer orders to any table
- **Read:** View all table information at a glance
- **Update:** Edit customer details, beer orders, and payment status
- **Delete:** Clear table when customer leaves

### 🔍 Search & Filtering
- Search by customer name, table number, or beer type
- Filter by table status (All, Occupied, Available)
- Filter by payment status (Paid, Unpaid)
- Clear all filters with one click

### 📤 Export Functionality
- **PDF Export:** Generate comprehensive reports with jsPDF
- **Excel Export:** Export data to Excel with summary statistics
- Professional formatting and layout

### 🚨 Notifications
- Toast notifications for all actions
- Visual indicators for unpaid customers
- Real-time status updates

## 🛠️ Tech Stack

- **Frontend:** React 18
- **Styling:** HTML + CSS (no frameworks)
- **Data Storage:** localStorage
- **Libraries:**
  - `jspdf` - PDF generation
  - `xlsx` - Excel export
  - `react-toastify` - Notifications

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd table_system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔑 Default Login Credentials

- **Email:** `admin@example.com`
- **Password:** `admin123`

## 📱 Usage

### Login
1. Enter the default credentials above
2. Click "Sign In" to access the dashboard

### Managing Tables
1. **Add Order:** Click "Add New Order" or click on any table card
2. **Edit Order:** Click the "Edit" button on any occupied table
3. **Mark as Paid:** Click "Mark Paid" for unpaid orders
4. **Clear Table:** Click "Clear" to remove customer data

### Searching & Filtering
1. Use the search bar to find specific customers or tables
2. Click filter buttons to show specific table states
3. Use "Clear Filters" to reset all filters

### Exporting Data
1. Click "Export PDF" to generate a PDF report
2. Click "Export Excel" to download an Excel file
3. Both exports include summary statistics

## 🎨 Design Features

- **Modern UI:** Clean, professional design with glassmorphism effects
- **Responsive:** Works on desktop, tablet, and mobile devices
- **Color Coding:** 
  - 🟢 Green: Available tables, paid customers
  - 🔴 Red: Occupied tables, unpaid customers
  - 🔵 Blue: Primary actions and highlights
- **Animations:** Smooth transitions and hover effects
- **Accessibility:** Keyboard navigation and screen reader friendly

## 📊 Data Structure

Each table record contains:
```javascript
{
  id: number,           // Table ID (1-15)
  tableNumber: number,  // Table number (1-15)
  customerName: string, // Customer's name
  beerOrdered: string, // Beer selection
  paymentStatus: string, // 'paid' or 'unpaid'
  timeOfOrder: string,  // ISO timestamp when order created
  timeFinished: string, // ISO timestamp when customer left
  isOccupied: boolean   // Whether table is currently occupied
}
```

## 🔧 Customization

### Adding New Beer Options
Edit the `beerOptions` array in `src/components/TableModal.js`:

```javascript
const beerOptions = [
  'Your New Beer',
  // ... existing options
];
```

### Modifying Table Count
Update the table initialization in `src/components/Dashboard.js`:

```javascript
const initialTables = Array.from({ length: 20 }, (_, index) => ({
  // ... table structure
}));
```

### Styling Changes
All styles are in `src/index.css` and `src/App.css` for easy customization.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The built files in the `build` folder can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3

## 📝 Notes

- All data is stored in browser localStorage
- No backend server required
- Data persists between browser sessions
- Works offline after initial load
- Compatible with all modern browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ for Table Support Management**
