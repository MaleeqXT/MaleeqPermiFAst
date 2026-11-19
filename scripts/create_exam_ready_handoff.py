from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_ALIGN_VERTICAL
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


OUTPUT = Path(r"C:\wamp64\www\MaleeqPermiFAst\docs\Exam Ready Students Claude Handoff.docx")


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def set_cell_border(cell, color="D9D9D9"):
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = tc_pr.first_child_found_in("w:tcBorders")
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tc_pr.append(borders)
    for edge in ("top", "left", "bottom", "right"):
        tag = f"w:{edge}"
        element = borders.find(qn(tag))
        if element is None:
            element = OxmlElement(tag)
            borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), "4")
        element.set(qn("w:color"), color)


def set_run_font(run, bold=None, size=None, color=None):
    run.font.name = "Aptos"
    run._element.rPr.rFonts.set(qn("w:ascii"), "Aptos")
    run._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos")
    if bold is not None:
        run.bold = bold
    if size is not None:
        run.font.size = Pt(size)
    if color is not None:
        run.font.color.rgb = RGBColor.from_string(color)


def add_text(document, text, *, style=None, bold=False, size=None, color=None, after=6):
    paragraph = document.add_paragraph(style=style)
    paragraph.paragraph_format.space_after = Pt(after)
    paragraph.paragraph_format.line_spacing = 1.14
    run = paragraph.add_run(text)
    set_run_font(run, bold=bold, size=size, color=color)
    return paragraph


def add_bullet(document, text):
    paragraph = document.add_paragraph(style="List Bullet")
    paragraph.paragraph_format.space_after = Pt(4)
    paragraph.paragraph_format.line_spacing = 1.1
    run = paragraph.add_run(text)
    set_run_font(run, size=10.5)
    return paragraph


def add_code(document, text):
    paragraph = document.add_paragraph()
    paragraph.paragraph_format.left_indent = Inches(0.22)
    paragraph.paragraph_format.space_after = Pt(4)
    run = paragraph.add_run(text)
    run.font.name = "Consolas"
    run._element.rPr.rFonts.set(qn("w:ascii"), "Consolas")
    run._element.rPr.rFonts.set(qn("w:hAnsi"), "Consolas")
    run.font.size = Pt(9)
    return paragraph


def add_table(document, headers, rows, widths):
    table = document.add_table(rows=1, cols=len(headers))
    table.autofit = False
    table.style = "Table Grid"
    header = table.rows[0]
    for index, label in enumerate(headers):
        cell = header.cells[index]
        cell.width = Inches(widths[index])
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        set_cell_shading(cell, "333333")
        set_cell_border(cell)
        paragraph = cell.paragraphs[0]
        paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
        run = paragraph.add_run(label)
        set_run_font(run, bold=True, size=9.5, color="FFFFFF")
    for row in rows:
        cells = table.add_row().cells
        for index, value in enumerate(row):
            cell = cells[index]
            cell.width = Inches(widths[index])
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_border(cell)
            paragraph = cell.paragraphs[0]
            paragraph.paragraph_format.space_after = Pt(2)
            run = paragraph.add_run(value)
            set_run_font(run, size=9.5)
    document.add_paragraph().paragraph_format.space_after = Pt(2)
    return table


def add_heading(document, text, level=1):
    paragraph = document.add_paragraph(style=f"Heading {level}")
    paragraph.paragraph_format.space_before = Pt(12 if level == 1 else 8)
    paragraph.paragraph_format.space_after = Pt(6)
    run = paragraph.add_run(text)
    set_run_font(run, bold=True, size=15 if level == 1 else 12, color="000000")
    return paragraph


document = Document()
section = document.sections[0]
section.top_margin = Inches(0.72)
section.bottom_margin = Inches(0.72)
section.left_margin = Inches(0.78)
section.right_margin = Inches(0.78)

styles = document.styles
styles["Normal"].font.name = "Aptos"
styles["Normal"]._element.rPr.rFonts.set(qn("w:ascii"), "Aptos")
styles["Normal"]._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos")
styles["Normal"].font.size = Pt(10.5)

title = document.add_paragraph(style="Title")
title.alignment = WD_ALIGN_PARAGRAPH.LEFT
title.paragraph_format.space_after = Pt(6)
title_run = title.add_run("Exam Ready Students Implementation Handoff")
set_run_font(title_run, bold=True, size=24, color="000000")

subtitle = document.add_paragraph()
subtitle.paragraph_format.space_after = Pt(16)
subtitle_run = subtitle.add_run("PassPermisFacile  |  Handoff for Claude")
set_run_font(subtitle_run, size=11, color="239A68")

add_text(
    document,
    "The Exam Ready Students feature is complete. A monitor can declare an assigned student ready for the driving exam, with preparation details. The declaration is saved in the Laravel database and appears in a dedicated admin table under Examens. The official exam booking and result flow remains unchanged.",
    size=11,
    after=10,
)

add_heading(document, "What is complete")
for item in [
    "Dedicated admin page: Examens > Élèves prêts at /exams/ready-students.",
    "The old ready-student table was removed from /exams so the normal exam list remains focused on actual exam records.",
    "Monitor candidate profile includes the Préparation à l’examen form.",
    "The form persists readiness, additional hours, practice frequency, and observation.",
    "Ready students are filtered by the selected admin zone and ordered by declaration date.",
    "The targeted readiness migration is now registered and applied in Laravel.",
]:
    add_bullet(document, item)

add_heading(document, "User flow")
add_heading(document, "Monitor declares a student ready", level=2)
for item in [
    "Open the monitor dashboard and select an assigned candidate to open the candidate profile drawer.",
    "Open the Préparation à l’examen section.",
    "Tick Élève prêt pour l’examen.",
    "Optionally add extra training hours, practice frequency, and an observation.",
    "Click Enregistrer la préparation.",
    "The server authorizes that the selected student belongs to the monitor, saves the data, and notifies secretariat when the ready state is new or changed.",
]:
    add_bullet(document, item)

add_heading(document, "Admin views ready students", level=2)
for item in [
    "Open the admin sidebar and expand Examens.",
    "Choose Élèves prêts.",
    "The page lists ready students with monitor, declaration date, additional hours, frequency, and observation.",
    "Use Voir le dossier to open the candidate dossier and continue the existing exam planning flow.",
]:
    add_bullet(document, item)

add_heading(document, "API contract")
add_table(document,
          ["Method", "Endpoint", "Purpose"],
          [
              ["GET", "/api/monitor/formation/{student}/exam-readiness", "Loads the monitor-owned readiness form and existing exam summary."],
              ["PUT", "/api/monitor/formation/{student}/exam-readiness", "Saves the monitor declaration and preparation fields."],
              ["GET", "/api/admin/exams", "Returns regular exams plus ready_students for the dedicated admin page."],
          ],
          [0.7, 3.0, 3.0])

add_text(document, "PUT request body", bold=True, size=10.5, after=4)
for route in [
    "is_ready: boolean (required)",
    "additional_hours: integer 1 to 100 or null",
    "practice_frequency: string up to 120 characters or null",
    "observation: string up to 2000 characters or null",
]:
    add_code(document, route)

add_heading(document, "Data model")
add_table(document,
          ["Table", "Role", "Important rule"],
          [
              ["monitor_exam_readinesses", "One preparation declaration per student.", "student_id is unique; a later save updates the same record."],
              ["monitor_exam_readiness_notifications", "Tracks secretary notifications for ready-state changes.", "Deduplicates notifications by readiness state hash."],
          ],
          [2.25, 2.35, 2.1])

add_text(document, "Migration", bold=True, size=10.5, after=3)
add_code(document, "database/migrations/2026_10_19_000001_create_monitor_exam_readiness_tables.php")
add_text(document, "The migration now checks each table before creating it. This preserves existing readiness records on databases where a table existed but the migration history was missing.", size=10.5, after=8)

add_heading(document, "Key implementation files")
add_table(document,
          ["Area", "File", "Responsibility"],
          [
              ["Admin UI", "src/Components/exams/ExamReadyStudents.jsx", "Dedicated ready-student table page."],
              ["Admin UI", "src/Components/exams/ExamReadyStudents.css", "Responsive styling for the table page."],
              ["Navigation", "src/Components/shared/Sidebar.jsx", "Examens dropdown and Élèves prêts child link."],
              ["Routing", "src/App.jsx", "Route for /exams/ready-students."],
              ["Monitor UI", "src/monitordashboard/CandidateProflileDrawer.jsx", "Readiness form and API calls."],
              ["Monitor API", "app/Http/Controllers/V1/EndPoint/Monitor/FormationController.php", "Loads and saves readiness for an authorized monitor."],
              ["Domain service", "app/Services/Monitor/Student/MonitorExamReadinessService.php", "Persistence, notification deduplication, and exam summary."],
              ["Admin API", "app/Http/Controllers/V1/EndPoint/Admin/Exam/AdminExamController.php", "Produces ready_students for staff."],
          ],
          [1.05, 3.65, 2.0])

add_heading(document, "Rules to preserve")
for item in [
    "Readiness is a monitor recommendation. It must not create, edit, or delete official StudentExam booking or result records.",
    "A monitor can only read or save readiness for an authorized assigned student.",
    "Admin staff sees only ready students in the currently selected zone.",
    "Do not move the ready-student table back onto /exams. Keep it in Examens > Élèves prêts.",
    "Keep the existing candidate dossier action as the bridge to the official planning flow.",
]:
    add_bullet(document, item)

add_heading(document, "Verification completed")
for item in [
    "Laravel readiness GET and PUT routes are registered under /api/monitor/formation/{student}/exam-readiness.",
    "The readiness migration completed successfully and is marked as ran in Laravel migration status.",
    "PHP syntax validation passed for the migration.",
    "The targeted MonitorFormation readiness feature test completed successfully.",
    "The frontend production build passed after the admin table was moved to its dedicated page.",
]:
    add_bullet(document, item)

add_heading(document, "Suggested next steps for Claude")
for item in [
    "Use the existing readiness endpoints and table instead of creating a parallel exam-ready model.",
    "If changing the monitor form, preserve the four payload fields and the authorization rule.",
    "If adding admin actions, keep actual exam scheduling inside the existing official exam workflow after Voir le dossier.",
    "Run the monitor readiness feature test and a frontend production build after related changes.",
]:
    add_bullet(document, item)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
document.save(OUTPUT)
print(OUTPUT)
