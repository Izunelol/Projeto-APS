package com.smartlab.rastreabilidade.inspectionpoint;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.smartlab.rastreabilidade.inspection.Inspection;
import com.smartlab.rastreabilidade.inspection.InspectionRepository;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InspectionPointReportService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final InspectionPointService inspectionPointService;
    private final InspectionRepository inspectionRepository;

    public byte[] generate(String code) {
        InspectionPoint point = inspectionPointService.getByCode(code);
        List<Inspection> inspections =
                inspectionRepository.findByInspectionPointIdOrderByInspectionDateDesc(point.getId());

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 54, 36);

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);
        Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 8);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            document.add(new Paragraph("Ficha do Ponto de Inspeção - " + point.getCode(), titleFont));
            document.add(Chunk.NEWLINE);

            document.add(new Paragraph("Dados Cadastrais", sectionFont));
            document.add(new Paragraph("Cliente: " + point.getClient().getName(), bodyFont));
            document.add(new Paragraph("Unidade: " + point.getUnit().getName(), bodyFont));
            document.add(new Paragraph("Área: " + point.getArea().getName(), bodyFont));
            document.add(new Paragraph("Tipo de Ponto: " + point.getPointType().getName(), bodyFont));
            document.add(new Paragraph(
                    "Localização: " + orDash(point.getLocationDescription()), bodyFont));
            document.add(new Paragraph("Status: " + point.getStatus(), bodyFont));
            document.add(new Paragraph("Criticidade: " + point.getCriticality(), bodyFont));
            if (point.getDescription() != null && !point.getDescription().isBlank()) {
                document.add(new Paragraph("Descrição: " + point.getDescription(), bodyFont));
            }
            document.add(Chunk.NEWLINE);

            document.add(new Paragraph("Histórico de Inspeções (" + inspections.size() + ")", sectionFont));
            document.add(Chunk.NEWLINE);

            if (inspections.isEmpty()) {
                document.add(new Paragraph("Nenhuma inspeção registrada até o momento.", bodyFont));
            } else {
                document.add(buildInspectionsTable(inspections, headerFont, cellFont));
            }
        } catch (DocumentException e) {
            throw new IllegalStateException("Falha ao gerar o relatório PDF do ponto: " + code, e);
        } finally {
            if (document.isOpen()) {
                document.close();
            }
        }

        return out.toByteArray();
    }

    private PdfPTable buildInspectionsTable(List<Inspection> inspections, Font headerFont, Font cellFont)
            throws DocumentException {
        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        table.setWidths(new float[] {10, 14, 12, 10, 10, 8, 20});

        for (String header : new String[] {
            "Data", "Responsável", "Condição Visual", "Continuidade (mΩ)", "Resistência (Ω)", "Conforme", "Observações"
        }) {
            table.addCell(new PdfPCell(new Phrase(header, headerFont)));
        }

        for (Inspection inspection : inspections) {
            table.addCell(new Phrase(inspection.getInspectionDate().format(DATE_FORMAT), cellFont));
            table.addCell(new Phrase(orDash(inspection.getResponsibleName()), cellFont));
            table.addCell(new Phrase(inspection.getVisualCondition().toString(), cellFont));
            table.addCell(new Phrase(orDash(inspection.getElectricalContinuityMohm()), cellFont));
            table.addCell(new Phrase(orDash(inspection.getGroundingResistanceOhm()), cellFont));
            table.addCell(new Phrase(inspection.isConforming() ? "Sim" : "Não", cellFont));
            table.addCell(new Phrase(orDash(inspection.getObservations()), cellFont));
        }

        return table;
    }

    private String orDash(Object value) {
        return value == null || value.toString().isBlank() ? "-" : value.toString();
    }
}
