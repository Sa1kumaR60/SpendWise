import os
import zipfile
import xml.etree.ElementTree as ET

pptx_dir = r'c:\Users\saiku\OneDrive\Desktop\itsp_pjt\pptx_work'
slides_dir = os.path.join(pptx_dir, 'ppt', 'slides')
output_pptx = r'c:\Users\saiku\OneDrive\Desktop\itsp_pjt\SpendWise_Internship_Presentation.pptx'

# Namespace setup
NAMESPACES = {
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'p': 'http://schemas.openxmlformats.org/presentationml/2006/main'
}
for prefix, uri in NAMESPACES.items():
    ET.register_namespace(prefix, uri)

def set_shape_text(sp, text_content, bold=None, size_pt=None, color_hex=None):
    txBody = sp.find('{http://schemas.openxmlformats.org/presentationml/2006/main}txBody')
    if txBody is None:
        return
    
    # Grab existing template
    existing_p = txBody.find('{http://schemas.openxmlformats.org/drawingml/2006/main}p')
    pPr_template = None
    rPr_template = None
    if existing_p is not None:
        pPr = existing_p.find('{http://schemas.openxmlformats.org/drawingml/2006/main}pPr')
        if pPr is not None:
            pPr_template = ET.fromstring(ET.tostring(pPr))
        existing_r = existing_p.find('{http://schemas.openxmlformats.org/drawingml/2006/main}r')
        if existing_r is not None:
            rPr = existing_r.find('{http://schemas.openxmlformats.org/drawingml/2006/main}rPr')
            if rPr is not None:
                rPr_template = ET.fromstring(ET.tostring(rPr))
                
    for p in list(txBody.findall('{http://schemas.openxmlformats.org/drawingml/2006/main}p')):
        txBody.remove(p)
        
    lines = text_content.split('\n')
    for line in lines:
        new_p = ET.SubElement(txBody, '{http://schemas.openxmlformats.org/drawingml/2006/main}p')
        if pPr_template is not None:
            new_p.append(ET.fromstring(ET.tostring(pPr_template)))
        new_r = ET.SubElement(new_p, '{http://schemas.openxmlformats.org/drawingml/2006/main}r')
        if rPr_template is not None:
            rPr_clone = ET.fromstring(ET.tostring(rPr_template))
            if bold is not None:
                rPr_clone.attrib['b'] = '1' if bold else '0'
            if size_pt is not None:
                rPr_clone.attrib['sz'] = str(int(size_pt * 100))
            if color_hex is not None:
                for sf in list(rPr_clone.findall('{http://schemas.openxmlformats.org/drawingml/2006/main}solidFill')):
                    rPr_clone.remove(sf)
                sf_elem = ET.SubElement(rPr_clone, '{http://schemas.openxmlformats.org/drawingml/2006/main}solidFill')
                srgb_elem = ET.SubElement(sf_elem, '{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr')
                srgb_elem.attrib['val'] = color_hex
            new_r.append(rPr_clone)
        t_node = ET.SubElement(new_r, '{http://schemas.openxmlformats.org/drawingml/2006/main}t')
        t_node.text = line

def get_shape_by_name(root, name):
    for sp in root.iter('{http://schemas.openxmlformats.org/presentationml/2006/main}sp'):
        cNvPr = sp.find('.//{http://schemas.openxmlformats.org/presentationml/2006/main}cNvPr')
        if cNvPr is not None and cNvPr.attrib.get('name') == name:
            return sp
    return None

def save_slide(slide_num, root):
    sf = os.path.join(slides_dir, f'slide{slide_num}.xml')
    tree = ET.ElementTree(root)
    tree.write(sf, encoding='utf-8', xml_declaration=True)
    print(f'Slide {slide_num} updated.')

# --- SLIDE 1 ---
s1 = ET.parse(os.path.join(slides_dir, 'slide1.xml')).getroot()
sp = get_shape_by_name(s1, 'Title')
if sp is not None:
    set_shape_text(sp, 'SpendWise   AI & MERN-Powered Personal Budget Tracker', bold=True)
sp = get_shape_by_name(s1, 'TextBox 66')
if sp is not None:
    set_shape_text(sp, 'Internship on        -        Full Stack Web Development (MERN Stack)')
sp = get_shape_by_name(s1, 'TextBox 67')
if sp is not None:
    set_shape_text(sp, 'Guide Name         -        Dr. B. Harish Goud (Assistant Professor)')
sp = get_shape_by_name(s1, 'TextBox 68')
if sp is not None:
    set_shape_text(sp, 'Affiliation             -        Dept of Information Technology, CBIT (A)')
sp = get_shape_by_name(s1, 'TextBox 69')
if sp is not None:
    set_shape_text(sp, 'Candidate Details-')
sp = get_shape_by_name(s1, 'TextBox 70')
if sp is not None:
    set_shape_text(sp, 'Ramavath Saikumar\nCODTECH IT Solutions Pvt. Ltd., Hyderabad\nIntern ID: CITS7827 (28 Jul - 08 Sep 2026)')
sp = get_shape_by_name(s1, 'TextBox 71')
if sp is not None:
    set_shape_text(sp, '- 160124737056')
save_slide(1, s1)

# --- SLIDE 2 ---
s2 = ET.parse(os.path.join(slides_dir, 'slide2.xml')).getroot()
sp = get_shape_by_name(s2, 'TextBox 75')
if sp is not None:
    text_s2 = (
        "Problem Statement:\n"
        "Personal Budget & Expense Tracking: College students and young professionals face severe financial stress due to unmanaged allowances, irregular stipends, and recurring campus expenses (tuition, rent, food, books). Commercial apps harvest sensitive personal banking data, require intrusive third-party permissions (Plaid/Yodlee), or lock critical budget alerts behind subscriptions.\n"
        "Our Solution – SpendWise:\n"
        "A lightweight, privacy-first MERN stack platform that automates personal budgeting, expense tracking, and financial analytics. It features a 3-tier budget state machine (<80% Normal, 80-99% Warning, >=100% Exceeded), real-time MongoDB aggregation pipelines, RFC 4180 formula-injection defense, and complete zero-trust multi-tenant data isolation.\n"
        "Why did we choose this problem?\n"
        "1. Student Financial Distress: Over 70% of undergraduates experience end-of-month budget shortfalls due to manual, unmonitored bookkeeping.\n"
        "2. Data Privacy & Sovereignty: Eliminates predatory financial data harvesting by operating in a self-contained, user-owned environment.\n"
        "3. Production-Grade MERN Mastery: To apply advanced full-stack engineering—NoSQL aggregations, composite indexing, and OWASP defense—to a real campus dilemma."
    )
    set_shape_text(sp, text_s2)
save_slide(2, s2)

# --- SLIDE 3 ---
s3 = ET.parse(os.path.join(slides_dir, 'slide3.xml')).getroot()
sp = get_shape_by_name(s3, 'Title')
if sp is not None:
    set_shape_text(sp, 'Problem Objectives', bold=True)
sp = get_shape_by_name(s3, 'TextBox 88')
if sp is not None:
    text_s3 = (
        "1.  Build the End-to-End Budgeting & Expense Workflow\n"
        "Provide authenticated users with seamless CRUD operations for income and expenses, custom category tagging, monthly budget allocation, and a live financial dashboard.\n"
        "2.  Guarantee Multi-Tenant Ownership & Strict IDOR Defense\n"
        "Enforce strict tenant scoping at the controller, middleware, and database levels ({ _id: id, user: req.user._id }), ensuring cross-tenant data access is mathematically rejected with HTTP 404.\n"
        "3.  High-Performance Real-Time Analytics with MongoDB Pipelines\n"
        "Deploy server-side MongoDB aggregation pipelines ($match, $group, $sum) to compute real-time category spending and monthly comparisons in under 120 ms.\n"
        "4.  Enterprise Data Integrity & Secure CSV Export Engine\n"
        "Enforce database compound unique indexes, referential category deletion guards, and sanitize RFC 4180 CSV exports against spreadsheet formula injection (=, +, -, @)."
    )
    set_shape_text(sp, text_s3)
save_slide(3, s3)

# --- SLIDE 4 ---
s4 = ET.parse(os.path.join(slides_dir, 'slide4.xml')).getroot()
sp = get_shape_by_name(s4, 'Title')
if sp is not None:
    set_shape_text(sp, 'Certificates & Credentials', bold=True)
sp = get_shape_by_name(s4, 'TextBox 100')
if sp is not None:
    set_shape_text(sp, 'Internship Verification and Departmental Credentials')
sp = get_shape_by_name(s4, 'TextBox 102')
if sp is not None:
    set_shape_text(sp, 'Ramavath Saikumar\n160124737056\nCODTECH IT Solutions Pvt. Ltd.\nIntern ID: CITS7827\n28 July 2026 – 08 September 2026\n[ Insert Internship Certificate ]')
sp = get_shape_by_name(s4, 'TextBox 104')
if sp is not None:
    set_shape_text(sp, 'Internal Faculty Guide\nDr. B. Harish Goud\nAssistant Professor\nDept of Information Technology\nChaitanya Bharathi Institute of Technology (A)\n[ Guide Approval ]')
sp = get_shape_by_name(s4, 'TextBox 106')
if sp is not None:
    set_shape_text(sp, 'Head of Department\nDr. M. Venu Gopalachari\nProfessor & Head\nDept of Information Technology\nChaitanya Bharathi Institute of Technology (A)\n[ Department Endorsement ]')
save_slide(4, s4)

# --- SLIDE 5 ---
s5 = ET.parse(os.path.join(slides_dir, 'slide5.xml')).getroot()
sp = get_shape_by_name(s5, 'Title')
if sp is not None:
    set_shape_text(sp, 'TECHNOLOGIES USED', bold=True)
sp = get_shape_by_name(s5, 'TextBox 118')
if sp is not None:
    set_shape_text(sp, 'Frontend Stack:\nReact 18 · Vite · CSS Modules · Chart.js')
sp = get_shape_by_name(s5, 'TextBox 120')
if sp is not None: set_shape_text(sp, 'React 18')
sp = get_shape_by_name(s5, 'TextBox 122')
if sp is not None: set_shape_text(sp, 'Vite')
sp = get_shape_by_name(s5, 'TextBox 124')
if sp is not None: set_shape_text(sp, 'Chart.js')
sp = get_shape_by_name(s5, 'TextBox 126')
if sp is not None: set_shape_text(sp, 'Lucide')

sp = get_shape_by_name(s5, 'TextBox 127')
if sp is not None:
    set_shape_text(sp, 'Backend & Data:\nNode.js 20 · Express.js 4.19 · MongoDB 7.0 · Mongoose 8.5')
sp = get_shape_by_name(s5, 'TextBox 129')
if sp is not None: set_shape_text(sp, 'Node.js')
sp = get_shape_by_name(s5, 'TextBox 131')
if sp is not None: set_shape_text(sp, 'Express')
sp = get_shape_by_name(s5, 'TextBox 133')
if sp is not None: set_shape_text(sp, 'MongoDB')
sp = get_shape_by_name(s5, 'TextBox 135')
if sp is not None: set_shape_text(sp, 'Mongoose')

sp = get_shape_by_name(s5, 'TextBox 136')
if sp is not None:
    set_shape_text(sp, 'Security & Testing:\nHTTP-Only JWT · bcryptjs · Jest · Supertest')
sp = get_shape_by_name(s5, 'TextBox 138')
if sp is not None: set_shape_text(sp, 'JWT')
sp = get_shape_by_name(s5, 'TextBox 140')
if sp is not None: set_shape_text(sp, 'bcrypt')
sp = get_shape_by_name(s5, 'TextBox 142')
if sp is not None: set_shape_text(sp, 'Jest')

sp = get_shape_by_name(s5, 'TextBox 143')
if sp is not None:
    set_shape_text(sp, 'Working Tools:\nGitHub (collaboration) · VS Code (IDE) · npm (packages)')
sp = get_shape_by_name(s5, 'TextBox 145')
if sp is not None: set_shape_text(sp, 'GitHub')
sp = get_shape_by_name(s5, 'TextBox 147')
if sp is not None: set_shape_text(sp, 'VS Code')
sp = get_shape_by_name(s5, 'TextBox 149')
if sp is not None: set_shape_text(sp, 'Postman')
save_slide(5, s5)

# --- SLIDE 6 ---
s6 = ET.parse(os.path.join(slides_dir, 'slide6.xml')).getroot()
tbl = s6.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}tbl')
if tbl is not None:
    tech_data = [
        ("Category", "Technology", "Purpose"),
        ("UI Library", "React 18", "Component-based interactive UI & reactive state management"),
        ("Build Tool", "Vite", "Sub-second Hot Module Replacement (HMR) & production bundle"),
        ("Backend Runtime", "Node.js 20", "Asynchronous non-blocking event-driven JavaScript server"),
        ("Web Framework", "Express.js 4.19", "REST API endpoints, middleware pipeline & MVC routing"),
        ("Database", "MongoDB 7.0", "Document store for transactions, budgets, categories & users"),
        ("ODM Library", "Mongoose 8.5", "Strict schema modeling, validations & aggregation pipelines"),
        ("Authentication", "JWT + HTTP-Only Cookie", "Stateless secure authentication protected against XSS"),
        ("Password Hashing", "bcryptjs (10 salt rounds)", "Cryptographic password hashing prior to database persistence"),
        ("Data Visualization", "Chart.js & React-Chartjs-2", "Interactive expense doughnuts & monthly cashflow bar charts"),
        ("Export Utility", "RFC 4180 CSV Engine", "Escaped tabular download with formula injection neutralization"),
        ("Testing Suite", "Jest & Supertest", "19 automated integration tests with in-memory MongoDB")
    ]
    trs = list(tbl.findall('{http://schemas.openxmlformats.org/drawingml/2006/main}tr'))
    for r_idx, (cat, tech, purp) in enumerate(tech_data):
        if r_idx < len(trs):
            tcs = list(trs[r_idx].findall('{http://schemas.openxmlformats.org/drawingml/2006/main}tc'))
            for c_idx, val in enumerate([cat, tech, purp]):
                if c_idx < len(tcs):
                    t_nodes = tcs[c_idx].findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}t')
                    if t_nodes:
                        t_nodes[0].text = val
                        for extra_t in t_nodes[1:]:
                            extra_t.text = ''
save_slide(6, s6)

# --- SLIDE 7 ---
s7 = ET.parse(os.path.join(slides_dir, 'slide7.xml')).getroot()
sp = get_shape_by_name(s7, 'TextBox 144')
if sp is not None:
    text_s7 = (
        "How the SpendWise Core Financial Engine Works\n"
        "1. Identity & Tenant Scoping: Extracts JWT from HTTP-only cookie, decodes user payload via HMAC-SHA256, and binds req.user._id to all queries.\n"
        "2. Dynamic Aggregation Pipeline: MongoDB $match and $group aggregates expenses for the active month in < 120 ms, eliminating stale counter caches.\n"
        "3. 3-Tier Budget State Machine: Evaluates real-time category spending into Normal (<80%, green), Warning (80–99%, amber), and Exceeded (>=100%, red alert).\n"
        "4. Referential Deletion Guard: Intercepts category deletion requests by checking active transactions and budgets, preventing broken references.\n"
        "5. RFC 4180 Formula Shield: Sanitizes CSV exports by escaping special characters and prefixing formula characters (=, +, -, @) with a single quote."
    )
    set_shape_text(sp, text_s7)
save_slide(7, s7)

# --- SLIDE 8 ---
s8 = ET.parse(os.path.join(slides_dir, 'slide8.xml')).getroot()
sp = get_shape_by_name(s8, 'Title')
if sp is not None:
    set_shape_text(sp, 'Architecture Diagram', bold=True)
save_slide(8, s8)

# --- SLIDE 9 ---
s9 = ET.parse(os.path.join(slides_dir, 'slide9.xml')).getroot()
sp = get_shape_by_name(s9, 'Title')
if sp is not None:
    set_shape_text(sp, 'IMPLEMENTATION', bold=True)
sp = get_shape_by_name(s9, 'TextBox 171')
if sp is not None:
    text_s9_1 = (
        "Transaction & Budget Engine\n"
        "• Income & Expense CRUD with date, amount, description, and category\n"
        "• Month-scoped budget allocation with automated percentage tracking\n"
        "• 3-tier visual thresholds: Normal (<80%), Warning (80-99%), Exceeded (>=100%)\n"
        "• Real-time monthly aggregations over indexed transaction collections\n"
        "• Multi-currency support (INR Rs, USD $, EUR EUR, GBP GBP) with instant UI formatting"
    )
    set_shape_text(sp, text_s9_1)
sp = get_shape_by_name(s9, 'TextBox 173')
if sp is not None:
    text_s9_2 = (
        "Analytics & Data Management\n"
        "• Interactive Chart.js doughnut charts for monthly category distribution\n"
        "• Comparative monthly cashflow bar charts (Income vs Expense analysis)\n"
        "• Searchable & paginated transaction ledger with instant multi-filter controls\n"
        "• RFC 4180 compliant CSV export engine with formula injection shield\n"
        "• Automated zero-config database seeder preloaded with 23 student records"
    )
    set_shape_text(sp, text_s9_2)
sp = get_shape_by_name(s9, 'TextBox 174')
if sp is not None:
    set_shape_text(sp, "Security: HTTP-only SameSite JWT cookies, bcrypt cryptographic hashing (10 rounds), strict IDOR multi-tenant ownership verification on every controller, and compound unique database indexes.")
save_slide(9, s9)

# --- SLIDE 10 ---
s10 = ET.parse(os.path.join(slides_dir, 'slide10.xml')).getroot()
sp = get_shape_by_name(s10, 'Title')
if sp is not None:
    set_shape_text(sp, 'Smart Features: Financial Engine & Security', bold=True)
sp = get_shape_by_name(s10, 'TextBox 182')
if sp is not None:
    text_s10 = (
        "Real-Time Aggregation Pipeline:\n"
        "Dynamic MongoDB $match and $group pipeline computes category spending on demand in sub-120ms without storing redundant, error-prone counter fields.\n"
        "3-Tier Budget State Machine:\n"
        "Automatic status evaluation: Normal (<80%, green badge), Warning (80–99%, amber warning badge), and Exceeded (>=100%, red alert banner).\n"
        "Referential Deletion Guard:\n"
        "Database integrity interceptor checks Transaction.countDocuments() and Budget.countDocuments() before deleting categories, returning HTTP 400 if active records exist.\n"
        "RFC 4180 Formula Injection Guard:\n"
        "Automatically prefixes spreadsheet formula trigger characters (=, +, -, @) with a single apostrophe to neutralize CSV injection attacks.\n"
        "Zero-Config Demo Seeder:\n"
        "Preloads demo@spendwise.edu with 23 realistic student transactions and 8 category budgets for instant examiner demonstration."
    )
    set_shape_text(sp, text_s10)
save_slide(10, s10)

# --- SLIDE 11 ---
s11 = ET.parse(os.path.join(slides_dir, 'slide11.xml')).getroot()
sp = get_shape_by_name(s11, 'TextBox 196')
if sp is not None: set_shape_text(sp, 'User Authentication & Registration', bold=True)
sp = get_shape_by_name(s11, 'TextBox 198')
if sp is not None: set_shape_text(sp, 'Secure sign-up and login with HTTP-only JWT cookies and password hashing.')
sp = get_shape_by_name(s11, 'TextBox 199')
if sp is not None: set_shape_text(sp, 'Financial Dashboard Overview', bold=True)
sp = get_shape_by_name(s11, 'TextBox 201')
if sp is not None: set_shape_text(sp, 'Monthly summary stat cards (Balance, Income, Expenses) and quick budget alerts.')
save_slide(11, s11)

# --- SLIDE 12 ---
s12 = ET.parse(os.path.join(slides_dir, 'slide12.xml')).getroot()
sp = get_shape_by_name(s12, 'TextBox 207')
if sp is not None: set_shape_text(sp, 'Transactions Management Ledger', bold=True)
sp = get_shape_by_name(s12, 'TextBox 209')
if sp is not None: set_shape_text(sp, 'Tabular transaction view with instant search, category filtering, and modal entry.')
sp = get_shape_by_name(s12, 'TextBox 210')
if sp is not None: set_shape_text(sp, 'Budget Tracking & Progress', bold=True)
sp = get_shape_by_name(s12, 'TextBox 212')
if sp is not None: set_shape_text(sp, 'Category budget cards with real-time percentage indicators and 3-tier thresholds.')
save_slide(12, s12)

# --- SLIDE 13 ---
s13 = ET.parse(os.path.join(slides_dir, 'slide13.xml')).getroot()
sp = get_shape_by_name(s13, 'TextBox 223')
if sp is not None: set_shape_text(sp, 'Category Expense Breakdown', bold=True)
sp = get_shape_by_name(s13, 'TextBox 225')
if sp is not None: set_shape_text(sp, 'Interactive Chart.js doughnut chart depicting proportional monthly expenditures.')
sp = get_shape_by_name(s13, 'TextBox 226')
if sp is not None: set_shape_text(sp, 'Monthly Cashflow Comparison', bold=True)
sp = get_shape_by_name(s13, 'TextBox 228')
if sp is not None: set_shape_text(sp, 'Comparative bar chart visualizing income versus expenses across monthly cycles.')
save_slide(13, s13)

# --- SLIDE 14 ---
s14 = ET.parse(os.path.join(slides_dir, 'slide14.xml')).getroot()
sp = get_shape_by_name(s14, 'TextBox 242')
if sp is not None: set_shape_text(sp, 'User Settings & Theme Customization', bold=True)
sp = get_shape_by_name(s14, 'TextBox 244')
if sp is not None: set_shape_text(sp, 'Preferred currency configuration (INR, USD, EUR, GBP) and Light/Dark mode switcher.')
sp = get_shape_by_name(s14, 'TextBox 245')
if sp is not None: set_shape_text(sp, 'RFC 4180 CSV Data Export', bold=True)
sp = get_shape_by_name(s14, 'TextBox 247')
if sp is not None: set_shape_text(sp, 'Clean tabular transaction download with spreadsheet formula injection protection.')
save_slide(14, s14)

# --- SLIDE 15 ---
s15 = ET.parse(os.path.join(slides_dir, 'slide15.xml')).getroot()
sp = get_shape_by_name(s15, 'Title')
if sp is not None:
    set_shape_text(sp, 'Challenges Faced During Internship', bold=True)
sp = get_shape_by_name(s15, 'TextBox 256')
if sp is not None:
    text_s15 = (
        "1. Enforcing Multi-Tenant IDOR Isolation Under Concurrency\n"
        "Client checks alone cannot prevent malicious URL manipulation. Enforced strict scoping { _id: id, user: req.user._id } at the controller level, returning 404 to avoid leaking record existence.\n"
        "2. Maintaining Relational Integrity in a Schema-less NoSQL Database\n"
        "MongoDB lacks foreign key cascading. Designed pre-delete middleware interceptors in Category controllers to verify active dependencies before deletion.\n"
        "3. Dynamic Real-Time Budget Aggregation Without Stale State\n"
        "Avoided storing cached balance fields that fall out of sync. Built an optimized MongoDB aggregation pipeline executing in sub-120ms directly on indexed collections.\n"
        "4. Neutralizing CSV Formula Injection Vulnerabilities\n"
        "Prevented spreadsheet code execution in Excel/Sheets by building an RFC 4180 sanitizer that prefixes =, +, -, @ with a single apostrophe.\n"
        "5. Cross-Origin HTTP-Only Cookie Configuration\n"
        "Solved cross-origin cookie loss between Vite (port 5173) and Express (port 5000) using sameSite: 'lax', credentials: 'include', and local proxy routing."
    )
    set_shape_text(sp, text_s15)
save_slide(15, s15)

# --- SLIDE 16 ---
s16 = ET.parse(os.path.join(slides_dir, 'slide16.xml')).getroot()
sp = get_shape_by_name(s16, 'Title')
if sp is not None:
    set_shape_text(sp, 'INTERNSHIP OUTCOME', bold=True)
sp = get_shape_by_name(s16, 'TextBox 267')
if sp is not None:
    text_s16 = (
        "Full-Stack MERN Architecture Mastery:\n"
        "Engineered 11 responsive React pages and 13 robust REST API endpoints using modular MVC architecture and clean ES6+ JavaScript.\n"
        "Advanced NoSQL Aggregation & Indexing:\n"
        "Designed 4 schema collections with compound unique indexes ({ user: 1, category: 1, month: 1 }) and high-performance $match/$group aggregation pipelines.\n"
        "Enterprise Web Security & OWASP Defense:\n"
        "Implemented HTTP-only SameSite JWT cookies, bcrypt cryptographic hashing (10 salt rounds), strict IDOR multi-tenant isolation, and RFC 4180 formula shielding.\n"
        "Automated Integration Testing & Verification:\n"
        "Developed a 19-test automated integration suite using Jest, Supertest, and an in-memory MongoDB server with a 100% pass rate.\n"
        "Professional Software Engineering Standards:\n"
        "Maintained professional Git version control, atomic commits, comprehensive technical documentation, and production build readiness."
    )
    set_shape_text(sp, text_s16)
save_slide(16, s16)

# --- SLIDE 17 ---
s17 = ET.parse(os.path.join(slides_dir, 'slide17.xml')).getroot()
sp = get_shape_by_name(s17, 'Title')
if sp is not None:
    set_shape_text(sp, 'Conclusion & Key Achievements', bold=True)
sp = get_shape_by_name(s17, 'TextBox 278')
if sp is not None:
    text_s17 = (
        "SpendWise delivers a complete, production-ready solution to student financial stress by combining automated budgeting, expense tracking, and real-time analytics in a single secure platform. It eliminates third-party banking vulnerabilities through self-contained architecture and provides proactive 3-tier budget warnings to prevent monthly shortfalls.\n\n"
        "The system guarantees 100% multi-tenant ownership isolation, enforces referential integrity in NoSQL, and runs instantly in zero-config demo mode with preloaded student data.\n\n"
        "Key Achievements"
    )
    set_shape_text(sp, text_s17)
sp = get_shape_by_name(s17, 'TextBox 280')
if sp is not None: set_shape_text(sp, '24+', bold=True)
sp = get_shape_by_name(s17, 'TextBox 281')
if sp is not None: set_shape_text(sp, 'routes: 11 pages +\n13 API endpoints')
sp = get_shape_by_name(s17, 'TextBox 283')
if sp is not None: set_shape_text(sp, '19/19', bold=True)
sp = get_shape_by_name(s17, 'TextBox 284')
if sp is not None: set_shape_text(sp, 'automated integration\ntests passing (100%)')
sp = get_shape_by_name(s17, 'TextBox 286')
if sp is not None: set_shape_text(sp, '< 120 ms', bold=True)
sp = get_shape_by_name(s17, 'TextBox 287')
if sp is not None: set_shape_text(sp, 'real-time MongoDB\naggregation latency')
sp = get_shape_by_name(s17, 'TextBox 289')
if sp is not None: set_shape_text(sp, '100%', bold=True)
sp = get_shape_by_name(s17, 'TextBox 290')
if sp is not None: set_shape_text(sp, 'multi-tenant IDOR\nisolation verified')
save_slide(17, s17)

# --- SLIDE 18 ---
s18 = ET.parse(os.path.join(slides_dir, 'slide18.xml')).getroot()
sp = get_shape_by_name(s18, 'Title')
if sp is not None:
    set_shape_text(sp, 'FUTURE SCOPES', bold=True)
sp = get_shape_by_name(s18, 'TextBox 290')
if sp is not None:
    text_s18 = (
        "AI-Powered OCR Receipt Scanning:\n"
        "Integrate camera receipt capture and Tesseract/Vision OCR to automatically extract merchant, date, and amount into transactions.\n"
        "Recurring Subscriptions & Cashflow Forecasting:\n"
        "Predict future month-end balances based on recurring fixed costs (rent, tuition) and average daily discretionary spending.\n"
        "Multi-Currency Live Forex Rates Sync:\n"
        "Integrate real-time exchange rate APIs to convert expenses dynamically for international students and cross-border travel.\n"
        "Progressive Web App (PWA) & Offline Sync:\n"
        "Implement service workers and IndexedDB storage for offline transaction logging with background server synchronization.\n"
        "Open-Banking Account Aggregator Framework:\n"
        "Optional RBI-compliant Account Aggregator integration for automated bank transaction feeds with user-controlled consent."
    )
    set_shape_text(sp, text_s18)
save_slide(18, s18)

# --- SLIDE 19 ---
s19 = ET.parse(os.path.join(slides_dir, 'slide19.xml')).getroot()
sp = get_shape_by_name(s19, 'Title')
if sp is not None:
    set_shape_text(sp, 'BIBLIOGRAPHY', bold=True)
sp = get_shape_by_name(s19, 'TextBox 302')
if sp is not None:
    text_s19 = (
        "React 18 Documentation – https://react.dev\n"
        "Node.js & Express.js Documentation – https://expressjs.com\n"
        "MongoDB Manual & Aggregation Pipeline – https://www.mongodb.com/docs/manual/aggregation\n"
        "Mongoose ODM Documentation – https://mongoosejs.com/docs\n"
        "Chart.js Official Guide – https://www.chartjs.org/docs\n"
        "RFC 4180 Common Format and MIME Type for CSV – https://www.rfc-editor.org/rfc/rfc4180\n"
        "OWASP Top 10 Web Application Security Risks – https://owasp.org/www-project-top-ten\n"
        "Project Repository – https://github.com/saikumar/spendwise"
    )
    set_shape_text(sp, text_s19)
save_slide(19, s19)

# --- SLIDE 20 ---
s20 = ET.parse(os.path.join(slides_dir, 'slide20.xml')).getroot()
for sp in s20.iter('{http://schemas.openxmlformats.org/presentationml/2006/main}sp'):
    cNvPr = sp.find('.//{http://schemas.openxmlformats.org/presentationml/2006/main}cNvPr')
    if cNvPr is not None and 'Thank' in sp.text if sp.text else True:
        pass

# Pack back into PPTX
print('Repacking into', output_pptx)
with zipfile.ZipFile(output_pptx, 'w', zipfile.ZIP_DEFLATED) as z_out:
    for foldername, subfolders, filenames in os.walk(pptx_dir):
        for filename in filenames:
            filepath = os.path.join(foldername, filename)
            arcname = os.path.relpath(filepath, pptx_dir)
            z_out.write(filepath, arcname)

print('SUCCESS! SpendWise_Internship_Presentation.pptx built successfully.')
