import os
import xml.etree.ElementTree as ET

pptx_dir = r'c:\Users\saiku\OneDrive\Desktop\itsp_pjt\pptx_work'
slides_dir = os.path.join(pptx_dir, 'ppt', 'slides')

def update_text_element(elem, new_text):
    elem.text = new_text

# Namespace map for parsing & saving
NAMESPACES = {
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'p': 'http://schemas.openxmlformats.org/presentationml/2006/main'
}
for prefix, uri in NAMESPACES.items():
    ET.register_namespace(prefix, uri)

def set_shape_paragraphs(sp, paragraphs_list):
    """
    Replaces all paragraphs in a shape with new paragraphs.
    paragraphs_list is a list of tuples: (text, is_bold, font_size_pt, color_hex, bullet_flag)
    or just a list of strings.
    """
    txBody = sp.find('{http://schemas.openxmlformats.org/presentationml/2006/main}txBody')
    if txBody is None:
        return
    
    # Grab existing pPr / rPr template if available
    existing_p = txBody.find('{http://schemas.openxmlformats.org/drawingml/2006/main}p')
    pPr_template = None
    rPr_template = None
    if existing_p is not None:
        pPr_template = existing_p.find('{http://schemas.openxmlformats.org/drawingml/2006/main}pPr')
        existing_r = existing_p.find('{http://schemas.openxmlformats.org/drawingml/2006/main}r')
        if existing_r is not None:
            rPr_template = existing_r.find('{http://schemas.openxmlformats.org/drawingml/2006/main}rPr')
    
    # Remove all existing <a:p> elements
    for p in list(txBody.findall('{http://schemas.openxmlformats.org/drawingml/2006/main}p')):
        txBody.remove(p)
        
    for item in paragraphs_list:
        new_p = ET.SubElement(txBody, '{http://schemas.openxmlformats.org/drawingml/2006/main}p')
        if pPr_template is not None:
            # clone pPr
            pPr_clone = ET.fromstring(ET.tostring(pPr_template))
            new_p.append(pPr_clone)
            
        if isinstance(item, tuple):
            text_val, is_bold, sz, col = item
            new_r = ET.SubElement(new_p, '{http://schemas.openxmlformats.org/drawingml/2006/main}r')
            new_rPr = ET.SubElement(new_r, '{http://schemas.openxmlformats.org/drawingml/2006/main}rPr')
            if rPr_template is not None:
                for k, v in rPr_template.attrib.items():
                    new_rPr.attrib[k] = v
            if is_bold is not None:
                new_rPr.attrib['b'] = '1' if is_bold else '0'
            if sz is not None:
                new_rPr.attrib['sz'] = str(int(sz * 100))
            if col is not None:
                solidFill = ET.SubElement(new_rPr, '{http://schemas.openxmlformats.org/drawingml/2006/main}solidFill')
                srgbClr = ET.SubElement(solidFill, '{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr')
                srgbClr.attrib['val'] = col
            t_node = ET.SubElement(new_r, '{http://schemas.openxmlformats.org/drawingml/2006/main}t')
            t_node.text = text_val
        else:
            new_r = ET.SubElement(new_p, '{http://schemas.openxmlformats.org/drawingml/2006/main}r')
            if rPr_template is not None:
                rPr_clone = ET.fromstring(ET.tostring(rPr_template))
                new_r.append(rPr_clone)
            t_node = ET.SubElement(new_r, '{http://schemas.openxmlformats.org/drawingml/2006/main}t')
            t_node.text = str(item)

print('Helper functions compiled cleanly.')
