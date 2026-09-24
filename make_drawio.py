import xml.etree.ElementTree as ET

def build_drawio():
    mxfile = ET.Element("mxfile", host="app.diagrams.net", modified="2026-09-24T02:30:00.000Z", agent="Antigravity", version="21.6.8", type="device")
    diagram = ET.SubElement(mxfile, "diagram", id="flowchart-gaji", name="Flowchart Penghasilan Karyawan")
    graph_model = ET.SubElement(diagram, "mxGraphModel", dx="1280", dy="950", grid="1", gridSize="10", guides="1", tooltips="1", connect="1", arrows="1", fold="1", page="1", pageScale="1", pageWidth="1169", pageHeight="1700", math="0", shadow="0")
    root = ET.SubElement(graph_model, "root")

    ET.SubElement(root, "mxCell", id="0")
    ET.SubElement(root, "mxCell", id="1", parent="0")

    def add_cell(id, value, style, vertex=None, edge=None, parent="1", source=None, target=None, x=None, y=None, w=None, h=None, points=None):
        cell = ET.SubElement(root, "mxCell", id=id, parent=parent)
        if value:
            cell.set("value", value)
        if style:
            cell.set("style", style)
        if vertex:
            cell.set("vertex", "1")
        if edge:
            cell.set("edge", "1")
        if source:
            cell.set("source", source)
        if target:
            cell.set("target", target)
        
        geo = ET.SubElement(cell, "mxGeometry")
        if x is not None:
            geo.set("x", str(x))
        if y is not None:
            geo.set("y", str(y))
        if w is not None:
            geo.set("width", str(w))
        if h is not None:
            geo.set("height", str(h))
        if edge:
            geo.set("relative", "1")
        if points:
            pts = ET.SubElement(geo, "Array", **{"as": "points"})
            for px, py in points:
                ET.SubElement(pts, "mxPoint", x=str(px), y=str(py))
        geo.set("as", "geometry")
        return cell

    # Styles
    CARD_STYLE = "rounded=1;whiteSpace=wrap;html=1;fillColor=#1e293b;strokeColor=#0f172a;strokeWidth=1;arcSize=6;shadow=1;"
    SIDEBAR_STYLE = "rounded=1;whiteSpace=wrap;html=1;fillColor=#f8fafc;strokeColor=#cbd5e1;strokeWidth=1;arcSize=6;shadow=1;align=left;spacingLeft=12;spacingRight=12;valign=top;spacingTop=12;"
    GROUP_STYLE = "rounded=1;whiteSpace=wrap;html=1;fillColor=#f8fafc;strokeColor=#cbd5e1;strokeWidth=1;dashed=1;dashPattern=6 6;arcSize=8;align=left;valign=top;spacingTop=8;spacingLeft=14;fontColor=#475569;fontStyle=1;fontSize=11;"
    START_STYLE = "rounded=1;arcSize=50;whiteSpace=wrap;html=1;fillColor=#10b981;strokeColor=#059669;fontColor=#ffffff;fontStyle=1;fontSize=13;shadow=1;"
    END_STYLE = "rounded=1;arcSize=50;whiteSpace=wrap;html=1;fillColor=#ef4444;strokeColor=#dc2626;fontColor=#ffffff;fontStyle=1;fontSize=13;shadow=1;"
    IO_STYLE = "shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fixedSize=1;rounded=1;arcSize=8;fillColor=#e0f2fe;strokeColor=#0284c7;strokeWidth=1.5;fontColor=#0369a1;fontSize=12;fontStyle=1;shadow=1;"
    DEC_STYLE = "rhombus;whiteSpace=wrap;html=1;fillColor=#fef3c7;strokeColor=#f59e0b;strokeWidth=1.5;fontColor=#92400e;fontStyle=1;fontSize=12;shadow=1;"
    PROC_STYLE = "rounded=1;whiteSpace=wrap;html=1;arcSize=10;fillColor=#eef2ff;strokeColor=#6366f1;strokeWidth=1.5;fontColor=#3730a3;fontStyle=1;fontSize=12;shadow=1;"
    PROC_CALC_STYLE = "rounded=1;whiteSpace=wrap;html=1;arcSize=10;fillColor=#eef2ff;strokeColor=#6366f1;strokeWidth=1.5;fontColor=#3730a3;fontStyle=0;fontSize=12;shadow=1;"
    ERR_STYLE = "shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fixedSize=1;rounded=1;arcSize=8;fillColor=#ffe4e6;strokeColor=#f43f5e;strokeWidth=1.5;fontColor=#9f1239;fontSize=11;fontStyle=1;shadow=1;"
    CONN_STYLE = "ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#6366f1;strokeColor=#4338ca;fontColor=#ffffff;fontStyle=1;fontSize=11;shadow=1;"
    
    EDGE_STYLE = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=2;endArrow=classic;endFill=1;"
    EDGE_YA = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#059669;strokeWidth=2;endArrow=classic;endFill=1;fontColor=#059669;fontStyle=1;fontSize=11;labelBackgroundColor=#ffffff;"
    EDGE_TIDAK = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#dc2626;strokeWidth=2;endArrow=classic;endFill=1;fontColor=#dc2626;fontStyle=1;fontSize=11;labelBackgroundColor=#ffffff;"

    # 1. Header Banner
    header_val = '<div style="font-family: Arial, sans-serif; text-align: center;"><div style="font-size: 17px; font-weight: bold; color: #f8fafc; letter-spacing: 0.5px;">FLOWCHART PERHITUNGAN PENGHASILAN KARYAWAN</div><div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Algoritma &amp; Pemrograman: Penentuan Gaji Pokok &amp; Gaji Lembur Berdasarkan Jam Kerja</div></div>'
    add_cell("header", header_val, CARD_STYLE, vertex=True, x=40, y=25, w=970, h=70)

    # 2. Side Info Card
    side_val = '<div style="font-family: Arial, sans-serif; font-size: 11px; color: #334155; line-height: 1.45;"><b style="font-size: 12px; color: #1e293b;">📋 KETENTUAN TUGAS</b><hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 6px 0;"><b>1. Gaji Golongan:</b><br>&bull; Golongan A : Rp 5.000.000<br>&bull; Golongan B : Rp 6.500.000<br>&bull; Golongan C : Rp 9.500.000<br><br><b>2. Gaji Lembur:</b><br>&bull; Lembur 1 Jam : 30% Gaji Pokok<br>&bull; Lembur 2 Jam : 32% Gaji Pokok<br>&bull; Lembur 3 Jam : 34% Gaji Pokok<br>&bull; Lembur 4 Jam : 36% Gaji Pokok<br>&bull; Lembur &ge; 5 Jam : 38% Gaji Pokok<br>&bull; 0 / &lt;1 Jam : 0% (Tidak Lembur)<br><br><b>3. Rumus Output:</b><br>gajiLembur = %lembur &times; gajiPokok<br>total = gajiPokok + gajiLembur</div>'
    add_cell("sidebar", side_val, SIDEBAR_STYLE, vertex=True, x=40, y=115, w=260, h=330)

    # Group Containers
    add_cell("group1", "TAHAP 1: PENENTUAN GAJI POKOK (GOLONGAN)", GROUP_STYLE, vertex=True, x=330, y=285, w=680, h=320)
    add_cell("group2", "TAHAP 2: PENENTUAN PERSENTASE LEMBUR", GROUP_STYLE, vertex=True, x=330, y=650, w=680, h=610)
    add_cell("group3", "TAHAP 3: KALKULASI PENGHASILAN &amp; OUTPUT", GROUP_STYLE, vertex=True, x=330, y=1300, w=680, h=330)

    # Nodes - Start & Input
    add_cell("start", "<b>MULAI</b>", START_STYLE, vertex=True, x=420, y=115, w=140, h=45)
    add_cell("input", "<b>Input:</b><br>golongan, jamLembur", IO_STYLE, vertex=True, x=380, y=190, w=220, h=55)

    # Edge: Start -> Input
    add_cell("e_start_in", "", EDGE_STYLE, edge=True, source="start", target="input")

    # Tahap 1: Golongan
    add_cell("dec_gol_a", "golongan == 'A' &lt;br&gt;atau 'a' ?", DEC_STYLE, vertex=True, x=400, y=315, w=180, h=70)
    add_cell("proc_gol_a", "gajiPokok = 5.000.000", PROC_STYLE, vertex=True, x=680, y=322, w=210, h=55)

    add_cell("dec_gol_b", "golongan == 'B' &lt;br&gt;atau 'b' ?", DEC_STYLE, vertex=True, x=400, y=415, w=180, h=70)
    add_cell("proc_gol_b", "gajiPokok = 6.500.000", PROC_STYLE, vertex=True, x=680, y=422, w=210, h=55)

    add_cell("dec_gol_c", "golongan == 'C' &lt;br&gt;atau 'c' ?", DEC_STYLE, vertex=True, x=400, y=515, w=180, h=70)
    add_cell("proc_gol_c", "gajiPokok = 9.500.000", PROC_STYLE, vertex=True, x=680, y=522, w=210, h=55)

    add_cell("err_gol", "<b>Output:</b><br>&quot;Golongan Tidak Valid!&quot;", ERR_STYLE, vertex=True, x=100, y=522, w=180, h=55)
    add_cell("conn1", "1", CONN_STYLE, vertex=True, x=475, y=615, w=30, h=30)

    # Connectors for Tahap 1
    # Input -> Dec Gol A
    add_cell("e_in_gola", "", EDGE_STYLE, edge=True, source="input", target="dec_gol_a")
    
    # Dec Gol A -> Proc Gol A (Ya) & Dec Gol B (Tidak)
    add_cell("e_gola_ya", "Ya", EDGE_YA, edge=True, source="dec_gol_a", target="proc_gol_a")
    add_cell("e_gola_tdk", "Tidak", EDGE_TIDAK, edge=True, source="dec_gol_a", target="dec_gol_b")

    # Dec Gol B -> Proc Gol B (Ya) & Dec Gol C (Tidak)
    add_cell("e_golb_ya", "Ya", EDGE_YA, edge=True, source="dec_gol_b", target="proc_gol_b")
    add_cell("e_golb_tdk", "Tidak", EDGE_TIDAK, edge=True, source="dec_gol_b", target="dec_gol_c")

    # Dec Gol C -> Proc Gol C (Ya) & Err Gol (Tidak)
    add_cell("e_golc_ya", "Ya", EDGE_YA, edge=True, source="dec_gol_c", target="proc_gol_c")
    add_cell("e_golc_tdk", "Tidak", EDGE_TIDAK, edge=True, source="dec_gol_c", target="err_gol")

    # Proc Gol A, B, C -> Conn 1
    add_cell("e_proca_conn1", "", EDGE_STYLE, edge=True, source="proc_gol_a", target="conn1", points=[(940, 350), (940, 630)])
    add_cell("e_procb_conn1", "", EDGE_STYLE, edge=True, source="proc_gol_b", target="conn1", points=[(940, 450), (940, 630)])
    add_cell("e_procc_conn1", "", EDGE_STYLE, edge=True, source="proc_gol_c", target="conn1", points=[(940, 550), (940, 630)])

    # Tahap 2: Jam Lembur
    add_cell("dec_lem1", "jamLembur == 1 ?", DEC_STYLE, vertex=True, x=400, y=675, w=180, h=65)
    add_cell("proc_lem1", "persenLembur = 0.30<br>(30%)", PROC_STYLE, vertex=True, x=680, y=680, w=210, h=55)

    add_cell("dec_lem2", "jamLembur == 2 ?", DEC_STYLE, vertex=True, x=400, y=770, w=180, h=65)
    add_cell("proc_lem2", "persenLembur = 0.32<br>(32%)", PROC_STYLE, vertex=True, x=680, y=775, w=210, h=55)

    add_cell("dec_lem3", "jamLembur == 3 ?", DEC_STYLE, vertex=True, x=400, y=865, w=180, h=65)
    add_cell("proc_lem3", "persenLembur = 0.34<br>(34%)", PROC_STYLE, vertex=True, x=680, y=870, w=210, h=55)

    add_cell("dec_lem4", "jamLembur == 4 ?", DEC_STYLE, vertex=True, x=400, y=960, w=180, h=65)
    add_cell("proc_lem4", "persenLembur = 0.36<br>(36%)", PROC_STYLE, vertex=True, x=680, y=965, w=210, h=55)

    add_cell("dec_lem5", "jamLembur &gt;= 5 ?", DEC_STYLE, vertex=True, x=400, y=1055, w=180, h=65)
    add_cell("proc_lem5", "persenLembur = 0.38<br>(38%)", PROC_STYLE, vertex=True, x=680, y=1060, w=210, h=55)

    add_cell("proc_lem0", "persenLembur = 0.00<br>(Tidak Lembur)", PROC_STYLE, vertex=True, x=400, y=1170, w=180, h=55)
    add_cell("conn2", "2", CONN_STYLE, vertex=True, x=475, y=1255, w=30, h=30)

    # Edges for Tahap 2
    add_cell("e_conn1_lem1", "", EDGE_STYLE, edge=True, source="conn1", target="dec_lem1")

    add_cell("e_lem1_ya", "Ya", EDGE_YA, edge=True, source="dec_lem1", target="proc_lem1")
    add_cell("e_lem1_tdk", "Tidak", EDGE_TIDAK, edge=True, source="dec_lem1", target="dec_lem2")

    add_cell("e_lem2_ya", "Ya", EDGE_YA, edge=True, source="dec_lem2", target="proc_lem2")
    add_cell("e_lem2_tdk", "Tidak", EDGE_TIDAK, edge=True, source="dec_lem2", target="dec_lem3")

    add_cell("e_lem3_ya", "Ya", EDGE_YA, edge=True, source="dec_lem3", target="proc_lem3")
    add_cell("e_lem3_tdk", "Tidak", EDGE_TIDAK, edge=True, source="dec_lem3", target="dec_lem4")

    add_cell("e_lem4_ya", "Ya", EDGE_YA, edge=True, source="dec_lem4", target="proc_lem4")
    add_cell("e_lem4_tdk", "Tidak", EDGE_TIDAK, edge=True, source="dec_lem4", target="dec_lem5")

    add_cell("e_lem5_ya", "Ya", EDGE_YA, edge=True, source="dec_lem5", target="proc_lem5")
    add_cell("e_lem5_tdk", "Tidak", EDGE_TIDAK, edge=True, source="dec_lem5", target="proc_lem0")

    add_cell("e_lem0_conn2", "", EDGE_STYLE, edge=True, source="proc_lem0", target="conn2")

    # Lembur 1-5 to Conn 2
    add_cell("e_procl1_conn2", "", EDGE_STYLE, edge=True, source="proc_lem1", target="conn2", points=[(940, 707), (940, 1270)])
    add_cell("e_procl2_conn2", "", EDGE_STYLE, edge=True, source="proc_lem2", target="conn2", points=[(940, 802), (940, 1270)])
    add_cell("e_procl3_conn2", "", EDGE_STYLE, edge=True, source="proc_lem3", target="conn2", points=[(940, 897), (940, 1270)])
    add_cell("e_procl4_conn2", "", EDGE_STYLE, edge=True, source="proc_lem4", target="conn2", points=[(940, 992), (940, 1270)])
    add_cell("e_procl5_conn2", "", EDGE_STYLE, edge=True, source="proc_lem5", target="conn2", points=[(940, 1087), (940, 1270)])

    # Tahap 3: Perhitungan & Output
    add_cell("calc", "<b>Hitung Gaji Lembur &amp; Total Penghasilan:</b><br><br>gajiLembur = persenLembur * gajiPokok<br>totalPenghasilan = gajiPokok + gajiLembur", PROC_CALC_STYLE, vertex=True, x=360, y=1330, w=260, h=80)
    add_cell("out_final", "<b>Output:</b><br>gajiPokok, gajiLembur,<br>totalPenghasilan", IO_STYLE, vertex=True, x=370, y=1445, w=240, h=65)
    add_cell("end", "<b>SELESAI</b>", END_STYLE, vertex=True, x=420, y=1550, w=140, h=45)

    # Edges for Tahap 3
    add_cell("e_conn2_calc", "", EDGE_STYLE, edge=True, source="conn2", target="calc")
    add_cell("e_calc_out", "", EDGE_STYLE, edge=True, source="calc", target="out_final")
    add_cell("e_out_end", "", EDGE_STYLE, edge=True, source="out_final", target="end")

    # Error path from Tahap 1 directly to End
    add_cell("e_err_end", "", "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#f43f5e;strokeWidth=2;dashed=1;endArrow=classic;endFill=1;labelBackgroundColor=#ffffff;", edge=True, source="err_gol", target="end", points=[(70, 550), (70, 1572)])

    xml_str = ET.tostring(mxfile, encoding="utf-8").decode("utf-8")
    with open("flowchart_gaji_karyawan.drawio", "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n' + xml_str)
    print("flowchart_gaji_karyawan.drawio successfully created!")

build_drawio()
