import os
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageFont

pptx_dir = r'c:\Users\saiku\OneDrive\Desktop\itsp_pjt\pptx_work'
media_dir = os.path.join(pptx_dir, 'ppt', 'media')
slides_dir = os.path.join(pptx_dir, 'ppt', 'slides')

def get_font(size, bold=False):
    font_names = ['segoeui.ttf', 'arial.ttf', 'calibri.ttf']
    if bold:
        font_names = ['segoeuib.ttf', 'arialbd.ttf', 'calibrib.ttf']
    for fn in font_names:
        fp = os.path.join(r'C:\Windows\Fonts', fn)
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except Exception:
                pass
    return ImageFont.load_default()

W, H = 1908, 1708

def create_base(title_text):
    img = Image.new('RGBA', (W, H), (248, 250, 252, 255))
    d = ImageDraw.Draw(img)
    d.rectangle([(0, 0), (W, 140)], fill=(255, 255, 255), outline=(226, 232, 240), width=2)
    d.rounded_rectangle([(60, 30), (140, 110)], radius=16, fill=(220, 38, 38))
    d.text((80, 42), '$', fill=(255, 255, 255), font=get_font(42, bold=True))
    d.text((160, 42), 'SpendWise', fill=(15, 23, 42), font=get_font(46, bold=True))
    d.text((500, 48), title_text, fill=(71, 85, 105), font=get_font(36, bold=True))
    d.rounded_rectangle([(W-480, 35), (W-60, 105)], radius=35, fill=(241, 245, 249), outline=(203, 213, 225), width=2)
    d.text((W-440, 52), 'Ramavath Saikumar (Demo)', fill=(30, 41, 59), font=get_font(26, bold=True))
    return img, d

# --- GENERATE IMAGES 49 TO 54 ---

# 3. Image49: Transactions Management Ledger
img49, d49 = create_base('Transactions Ledger & Search')
d49.rounded_rectangle([(80, 180), (1828, 290)], radius=18, fill=(255, 255, 255), outline=(226, 232, 240), width=2)
d49.rounded_rectangle([(120, 205), (600, 265)], radius=12, fill=(248, 250, 252), outline=(203, 213, 225), width=2)
d49.text((140, 222), 'Search transactions...', fill=(148, 163, 184), font=get_font(22))

pills = [('All Types', 640), ('Expense Only', 800), ('Income Only', 1000), ('November 2026', 1200)]
for ptext, px in pills:
    d49.rounded_rectangle([(px, 205), (px+170, 265)], radius=12, fill=(241, 245, 249))
    d49.text((px+20, 222), ptext, fill=(51, 65, 85), font=get_font(20, bold=True))

d49.rounded_rectangle([(1520, 205), (1780, 265)], radius=12, fill=(220, 38, 38))
d49.text((1550, 222), '+ Add Transaction', fill=(255, 255, 255), font=get_font(22, bold=True))

d49.rounded_rectangle([(80, 330), (1828, 1620)], radius=20, fill=(255, 255, 255), outline=(226, 232, 240), width=3)
d49.rectangle([(80, 330), (1828, 420)], fill=(248, 250, 252))
d49.text((130, 360), 'DATE', fill=(100, 116, 139), font=get_font(20, bold=True))
d49.text((360, 360), 'DESCRIPTION', fill=(100, 116, 139), font=get_font(20, bold=True))
d49.text((950, 360), 'CATEGORY', fill=(100, 116, 139), font=get_font(20, bold=True))
d49.text((1250, 360), 'TYPE', fill=(100, 116, 139), font=get_font(20, bold=True))
d49.text((1550, 360), 'AMOUNT (INR)', fill=(100, 116, 139), font=get_font(20, bold=True))

ledger = [
    ('15 Nov 2026', 'Amazon AWS Server & Hosting', 'Technology', 'Expense', '- Rs. 1,840.00', (220, 38, 38)),
    ('14 Nov 2026', 'College Tuition & Lab Fee', 'Education', 'Expense', '- Rs. 12,000.00', (220, 38, 38)),
    ('12 Nov 2026', 'CODTECH Internship Stipend', 'Stipend', 'Income', '+ Rs. 25,000.00', (16, 185, 129)),
    ('10 Nov 2026', 'Campus Hostel Rent & Utilities', 'Housing', 'Expense', '- Rs. 6,500.00', (220, 38, 38)),
    ('08 Nov 2026', 'Canteen & Grocery Supplies', 'Food', 'Expense', '- Rs. 2,340.00', (220, 38, 38)),
    ('05 Nov 2026', 'Web Development Freelance', 'Freelance', 'Income', '+ Rs. 15,000.00', (16, 185, 129)),
    ('04 Nov 2026', 'Spotify & Netflix Student Sub', 'Entertainment', 'Expense', '- Rs. 499.00', (220, 38, 38)),
    ('02 Nov 2026', 'Metro Travel & Transportation', 'Transport', 'Expense', '- Rs. 850.00', (220, 38, 38)),
    ('01 Nov 2026', 'Technical Books & Coursera', 'Education', 'Expense', '- Rs. 1,460.00', (220, 38, 38)),
    ('28 Oct 2026', 'Pharmacy & Health Checkup', 'Health', 'Expense', '- Rs. 750.00', (220, 38, 38)),
    ('25 Oct 2026', 'Client UI Consultation', 'Freelance', 'Income', '+ Rs. 10,000.00', (16, 185, 129))
]
ly = 430
for dt, desc, cat, typ, amt, col in ledger:
    d49.line([(80, ly), (1828, ly)], fill=(241, 245, 249), width=2)
    d49.text((130, ly+25), dt, fill=(100, 116, 139), font=get_font(22))
    d49.text((360, ly+25), desc, fill=(15, 23, 42), font=get_font(24, bold=True))
    d49.rounded_rectangle([(950, ly+20), (1120, ly+65)], radius=12, fill=(241, 245, 249))
    d49.text((970, ly+28), cat, fill=(71, 85, 105), font=get_font(20, bold=True))
    
    t_bg = (254, 242, 242) if typ == 'Expense' else (236, 253, 245)
    t_fg = (220, 38, 38) if typ == 'Expense' else (16, 185, 129)
    d49.rounded_rectangle([(1250, ly+20), (1370, ly+65)], radius=12, fill=t_bg)
    d49.text((1270, ly+28), typ, fill=t_fg, font=get_font(20, bold=True))
    
    d49.text((1550, ly+25), amt, fill=col, font=get_font(26, bold=True))
    ly += 95

img49.save(os.path.join(media_dir, 'image49.png'))
print('Saved image49.png (Transactions)')

# 4. Image50: Budgets & Spending Thresholds
img50, d50 = create_base('Budgets & 3-Tier Spending Alerts')
d50.rounded_rectangle([(80, 180), (1828, 290)], radius=18, fill=(255, 255, 255), outline=(226, 232, 240), width=2)
d50.text((120, 222), '3-Tier State Machine Status Legend:', fill=(15, 23, 42), font=get_font(24, bold=True))
d50.rounded_rectangle([(650, 210), (950, 260)], radius=12, fill=(236, 253, 245), outline=(16, 185, 129), width=2)
d50.text((670, 224), 'NORMAL (< 80%)', fill=(16, 185, 129), font=get_font(20, bold=True))

d50.rounded_rectangle([(1000, 210), (1340, 260)], radius=12, fill=(254, 243, 199), outline=(245, 158, 11), width=2)
d50.text((1020, 224), 'WARNING (80 - 99%)', fill=(217, 119, 6), font=get_font(20, bold=True))

d50.rounded_rectangle([(1390, 210), (1750, 260)], radius=12, fill=(254, 242, 242), outline=(220, 38, 38), width=2)
d50.text((1410, 224), 'EXCEEDED (>= 100%)', fill=(220, 38, 38), font=get_font(20, bold=True))

b_grid = [
    ('Food & Dining', 'Rs. 4,850.00', 'Rs. 6,000.00', 81, (245, 158, 11), 'WARNING: 81% consumed', 80, 330),
    ('Hostel & Housing', 'Rs. 6,500.00', 'Rs. 7,000.00', 93, (245, 158, 11), 'WARNING: 93% consumed', 980, 330),
    ('Entertainment & Outings', 'Rs. 2,800.00', 'Rs. 2,500.00', 112, (220, 38, 38), 'EXCEEDED: +Rs. 300 over limit!', 80, 750),
    ('Education & Textbooks', 'Rs. 13,460.00', 'Rs. 20,000.00', 67, (16, 185, 129), 'NORMAL: Healthy allowance', 980, 750),
    ('Transportation & Fuel', 'Rs. 850.00', 'Rs. 2,000.00', 42, (16, 185, 129), 'NORMAL: Rs. 1,150 remaining', 80, 1170),
    ('Cloud & Tech Utilities', 'Rs. 1,840.00', 'Rs. 2,200.00', 84, (245, 158, 11), 'WARNING: 84% consumed', 980, 1170)
]
for title, sp, lim, pct, col, note, bx, by in b_grid:
    d50.rounded_rectangle([(bx, by), (bx+840, by+360)], radius=20, fill=(255, 255, 255), outline=(226, 232, 240), width=3)
    d50.rectangle([(bx, by), (bx+840, by+15)], fill=col)
    d50.text((bx+40, by+40), title, fill=(15, 23, 42), font=get_font(30, bold=True))
    d50.text((bx+680, by+40), f'{pct}%', fill=col, font=get_font(32, bold=True))
    d50.text((bx+40, by+100), f'Spent: {sp}', fill=(51, 65, 85), font=get_font(24, bold=True))
    d50.text((bx+450, by+100), f'Limit: {lim}', fill=(100, 116, 139), font=get_font(24))
    
    d50.rounded_rectangle([(bx+40, by+160), (bx+800, by+195)], radius=15, fill=(226, 232, 240))
    bar_w = min(760, int(760 * (pct / 100)))
    d50.rounded_rectangle([(bx+40, by+160), (bx+40+bar_w, by+195)], radius=15, fill=col)
    
    d50.text((bx+40, by+230), note, fill=col, font=get_font(22, bold=True))
    d50.text((bx+40, by+280), 'Compound Index: { user: 1, category: 1, month: 1 } enforced', fill=(148, 163, 184), font=get_font(18))

img50.save(os.path.join(media_dir, 'image50.png'))
print('Saved image50.png (Budgets)')

# 5. Image51: Category Expense Breakdown
img51, d51 = create_base('Category Analytics & Distribution')
d51.rounded_rectangle([(80, 180), (1828, 1620)], radius=24, fill=(255, 255, 255), outline=(226, 232, 240), width=3)
d51.text((120, 220), 'Monthly Expense Distribution (Chart.js Doughnut)', fill=(15, 23, 42), font=get_font(36, bold=True))
d51.text((120, 280), 'Sub-120ms aggregation via MongoDB $match and $group pipeline', fill=(100, 116, 139), font=get_font(24))

cx, cy = 600, 900
r_out = 400
r_in = 220
slices = [
    (0, 115, (220, 38, 38), 'Food & Dining (32%)'),
    (115, 216, (59, 130, 246), 'Hostel & Housing (28%)'),
    (216, 288, (16, 185, 129), 'Education & Courses (20%)'),
    (288, 331, (245, 158, 11), 'Entertainment (12%)'),
    (331, 360, (168, 85, 247), 'Transportation (8%)')
]
for start_a, end_a, col, _ in slices:
    d51.pieslice([(cx-r_out, cy-r_out), (cx+r_out, cy+r_out)], start=start_a, end=end_a, fill=col, outline=(255, 255, 255), width=4)

d51.pieslice([(cx-r_in, cy-r_in), (cx+r_in, cy+r_in)], start=0, end=360, fill=(255, 255, 255))
d51.text((cx-110, cy-50), 'Total Spent', fill=(100, 116, 139), font=get_font(26, bold=True))
d51.text((cx-130, cy), 'Rs. 22,150', fill=(15, 23, 42), font=get_font(46, bold=True))

ly = 450
for _, _, col, label in slices:
    d51.rounded_rectangle([(1100, ly), (1150, ly+50)], radius=10, fill=col)
    d51.text((1180, ly+8), label, fill=(15, 23, 42), font=get_font(28, bold=True))
    d51.text((1180, ly+55), 'Live aggregated from indexed collection transactions', fill=(148, 163, 184), font=get_font(20))
    ly += 140

d51.rounded_rectangle([(1100, 1150), (1760, 1540)], radius=16, fill=(15, 23, 42))
d51.text((1130, 1180), 'MongoDB Aggregation Query (Backend):', fill=(220, 38, 38), font=get_font(22, bold=True))
d51.text((1130, 1230), 'Transaction.aggregate([', fill=(255, 255, 255), font=get_font(20))
d51.text((1150, 1270), '  { $match: { user: req.user._id, type: "expense" } },', fill=(148, 163, 184), font=get_font(20))
d51.text((1150, 1310), '  { $group: { _id: "$category", total: { $sum: "$amount" } } },', fill=(148, 163, 184), font=get_font(20))
d51.text((1150, 1350), '  { $lookup: { from: "categories", ... } }', fill=(148, 163, 184), font=get_font(20))
d51.text((1130, 1390), ']) // Execution time: ~ 45 ms', fill=(16, 185, 129), font=get_font(20, bold=True))

img51.save(os.path.join(media_dir, 'image51.png'))
print('Saved image51.png (Analytics)')

# 6. Image52: Monthly Cashflow Comparison
img52, d52 = create_base('Monthly Cashflow & Trends')
d52.rounded_rectangle([(80, 180), (1828, 1620)], radius=24, fill=(255, 255, 255), outline=(226, 232, 240), width=3)
d52.text((120, 220), '6-Month Income vs Expense Trend (Chart.js Bar)', fill=(15, 23, 42), font=get_font(36, bold=True))
d52.text((120, 280), 'Demonstrating consistent student savings and positive cash flow margin', fill=(100, 116, 139), font=get_font(24))

chart_x1, chart_y1, chart_x2, chart_y2 = 180, 420, 1720, 1350
d52.line([(chart_x1, chart_y2), (chart_x2, chart_y2)], fill=(148, 163, 184), width=3)
for val, ypos in [(60000, 480), (45000, 680), (30000, 880), (15000, 1080), (0, 1350)]:
    d52.line([(chart_x1, ypos), (chart_x2, ypos)], fill=(241, 245, 249), width=2)
    d52.text((chart_x1-90, ypos-15), f'Rs.{val//1000}k', fill=(148, 163, 184), font=get_font(20))

months = [
    ('June 2026', 35000, 22000),
    ('July 2026', 45000, 28000),
    ('August 2026', 50000, 31000),
    ('Sept 2026', 55000, 24000),
    ('October 2026', 60000, 26000),
    ('Nov 2026', 65000, 22150)
]
bar_step = (chart_x2 - chart_x1) // 6
for i, (mname, inc, exp) in enumerate(months):
    bx = chart_x1 + i * bar_step + 40
    h_inc = int((inc / 65000) * (chart_y2 - 480))
    d52.rounded_rectangle([(bx, chart_y2 - h_inc), (bx+80, chart_y2)], radius=8, fill=(16, 185, 129))
    h_exp = int((exp / 65000) * (chart_y2 - 480))
    d52.rounded_rectangle([(bx+95, chart_y2 - h_exp), (bx+175, chart_y2)], radius=8, fill=(220, 38, 38))
    d52.text((bx+20, chart_y2+20), mname, fill=(51, 65, 85), font=get_font(20, bold=True))

d52.rounded_rectangle([(700, 1450), (740, 1490)], radius=6, fill=(16, 185, 129))
d52.text((760, 1455), 'Monthly Income (Stipends & Freelance)', fill=(15, 23, 42), font=get_font(24, bold=True))

d52.rounded_rectangle([(1200, 1450), (1240, 1490)], radius=6, fill=(220, 38, 38))
d52.text((1260, 1455), 'Monthly Expenses (Tuition, Rent, Living)', fill=(15, 23, 42), font=get_font(24, bold=True))

img52.save(os.path.join(media_dir, 'image52.png'))
print('Saved image52.png (Cashflow)')

# 7. Image53: Settings & Theme Toggle
img53, d53 = create_base('User Settings & Preferences')
d53.rounded_rectangle([(80, 180), (1828, 1620)], radius=24, fill=(255, 255, 255), outline=(226, 232, 240), width=3)
d53.text((120, 220), 'User Profile & Interface Customization', fill=(15, 23, 42), font=get_font(36, bold=True))

d53.rounded_rectangle([(120, 300), (920, 780)], radius=20, fill=(248, 250, 252), outline=(203, 213, 225), width=2)
d53.text((160, 340), 'User Profile Details', fill=(15, 23, 42), font=get_font(28, bold=True))
d53.text((160, 410), 'Full Name: Ramavath Saikumar', fill=(51, 65, 85), font=get_font(24))
d53.text((160, 470), 'Roll Number: 160124737056', fill=(51, 65, 85), font=get_font(24))
d53.text((160, 530), 'Department: Information Technology, CBIT', fill=(51, 65, 85), font=get_font(24))
d53.text((160, 590), 'Company: CODTECH IT Solutions Pvt. Ltd.', fill=(51, 65, 85), font=get_font(24))
d53.text((160, 650), 'Intern ID: CITS7827', fill=(51, 65, 85), font=get_font(24))

d53.rounded_rectangle([(980, 300), (1780, 780)], radius=20, fill=(248, 250, 252), outline=(203, 213, 225), width=2)
d53.text((1020, 340), 'Preferred Currency Configuration', fill=(15, 23, 42), font=get_font(28, bold=True))
d53.text((1020, 400), 'Instantly formats all tables, cards & charts without reloading', fill=(100, 116, 139), font=get_font(20))
currencies = [
    ('INR (Rs.) - Indian Rupee [Active]', (220, 38, 38), 470),
    ('USD ($) - US Dollar', (100, 116, 139), 540),
    ('EUR (EUR) - Euro', (100, 116, 139), 610),
    ('GBP (GBP) - British Pound', (100, 116, 139), 680)
]
for cname, ccol, cy in currencies:
    d53.rounded_rectangle([(1020, cy), (1740, cy+55)], radius=10, fill=(255, 255, 255), outline=ccol, width=2)
    d53.text((1040, cy+12), cname, fill=ccol, font=get_font(22, bold=True))

d53.rounded_rectangle([(120, 840), (1780, 1540)], radius=20, fill=(248, 250, 252), outline=(203, 213, 225), width=2)
d53.text((160, 880), 'Display Theme & Aesthetic Mode', fill=(15, 23, 42), font=get_font(28, bold=True))

d53.rounded_rectangle([(160, 960), (920, 1460)], radius=16, fill=(255, 255, 255), outline=(220, 38, 38), width=3)
d53.text((200, 1000), 'Light Mode (Active)', fill=(220, 38, 38), font=get_font(26, bold=True))
d53.text((200, 1060), 'High-contrast clean canvas with red accent #dc2626', fill=(100, 116, 139), font=get_font(20))
d53.rounded_rectangle([(200, 1140), (880, 1400)], radius=12, fill=(241, 245, 249))
d53.text((240, 1240), 'Light Mode Preview: High Readability', fill=(51, 65, 85), font=get_font(24, bold=True))

d53.rounded_rectangle([(980, 960), (1740, 1460)], radius=16, fill=(15, 23, 42), outline=(71, 85, 105), width=2)
d53.text((1020, 1000), 'Dark Mode', fill=(255, 255, 255), font=get_font(26, bold=True))
d53.text((1020, 1060), 'Deep slate #0f172a theme reducing student eye fatigue', fill=(148, 163, 184), font=get_font(20))
d53.rounded_rectangle([(1020, 1140), (1700, 1400)], radius=12, fill=(30, 41, 59))
d53.text((1060, 1240), 'Dark Mode Preview: Midnight Slate', fill=(255, 255, 255), font=get_font(24, bold=True))

img53.save(os.path.join(media_dir, 'image53.png'))
print('Saved image53.png (Settings)')

# 8. Image54: RFC 4180 CSV Export
img54, d54 = create_base('RFC 4180 CSV Data Export')
d54.rounded_rectangle([(80, 180), (1828, 1620)], radius=24, fill=(255, 255, 255), outline=(226, 232, 240), width=3)
d54.text((120, 220), 'Data Export & Formula Injection Defense', fill=(15, 23, 42), font=get_font(36, bold=True))

d54.rounded_rectangle([(120, 300), (1780, 480)], radius=16, fill=(236, 253, 245), outline=(16, 185, 129), width=3)
d54.text((160, 330), 'Active Security: RFC 4180 & CSV Formula Injection Neutralization', fill=(5, 150, 105), font=get_font(28, bold=True))
d54.text((160, 385), 'Spreadsheet executable formula prefixes (=, +, -, @) are automatically shielded with a single quote (\').', fill=(15, 23, 42), font=get_font(22))
d54.text((160, 425), 'Prevents malicious formula execution, command injection and unauthorized exfiltration in Excel and Google Sheets.', fill=(100, 116, 139), font=get_font(20))

d54.rounded_rectangle([(120, 520), (1780, 1540)], radius=20, fill=(248, 250, 252), outline=(203, 213, 225), width=2)
d54.text((160, 560), 'Export Format Preview (SpendWise_Transactions_Nov2026.csv)', fill=(15, 23, 42), font=get_font(28, bold=True))

d54.rounded_rectangle([(160, 620), (1740, 1340)], radius=12, fill=(15, 23, 42))
csv_lines = [
    'Date,Type,Category,Amount,Description,PaymentMethod',
    '2026-11-15,expense,Technology,1840.00,"AWS Server Hosting & DB",Card',
    '2026-11-14,expense,Education,12000.00,"College Tuition & Lab Fee",UPI',
    '2026-11-12,income,Stipend,25000.00,"CODTECH Internship Stipend (CITS7827)",BankTransfer',
    '2026-11-10,expense,Housing,6500.00,"Campus Hostel Rent & Utilities",NetBanking',
    '2026-11-08,expense,Food,2340.00,"Canteen & Grocery Supplies",UPI',
    '2026-11-05,income,Freelance,15000.00,"Web Development Freelance Milestone",UPI',
    '2026-11-04,expense,Entertainment,499.00,"Spotify & Netflix Student Sub",Card',
    '2026-11-02,expense,Transport,850.00,"Metro Travel & Transportation",UPI',
    '2026-11-01,expense,Education,1460.00,"\'=SUM(A1:A10) Safe Escaped",UPI  <-- Shielded!',
    '2026-10-28,expense,Health,750.00,"Pharmacy & Health Checkup",Cash'
]
cy = 660
for line in csv_lines:
    f_col = (245, 158, 11) if 'Shielded' in line else ((16, 185, 129) if 'Date,' in line else (241, 245, 249))
    d54.text((200, cy), line, fill=f_col, font=get_font(22))
    cy += 58

d54.rounded_rectangle([(1380, 1400), (1740, 1490)], radius=14, fill=(220, 38, 38))
d54.text((1430, 1430), 'Download CSV', fill=(255, 255, 255), font=get_font(26, bold=True))
d54.text((200, 1435), 'HTTP Response: Content-Type: text/csv; Content-Disposition: attachment; filename=spendwise.csv', fill=(100, 116, 139), font=get_font(20))

img54.save(os.path.join(media_dir, 'image54.png'))
print('Saved image54.png (CSV Export)')
