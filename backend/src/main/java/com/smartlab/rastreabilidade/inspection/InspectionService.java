package com.smartlab.rastreabilidade.inspection;

import com.smartlab.rastreabilidade.auth.UserPrincipal;
import com.smartlab.rastreabilidade.common.NotFoundException;
import com.smartlab.rastreabilidade.inspection.dto.InspectionRequest;
import com.smartlab.rastreabilidade.inspectionpoint.InspectionPoint;
import com.smartlab.rastreabilidade.inspectionpoint.InspectionPointService;
import com.smartlab.rastreabilidade.user.User;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InspectionService {

    private final InspectionRepository inspectionRepository;
    private final InspectionPointService inspectionPointService;

    public List<Inspection> listByPointCode(String code) {
        InspectionPoint point = inspectionPointService.getByCode(code);
        return inspectionRepository.findByInspectionPointIdOrderByInspectionDateDesc(point.getId());
    }

    public Inspection getById(UUID id) {
        return inspectionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Inspeção não encontrada: " + id));
    }

    @Transactional
    public Inspection create(String code, InspectionRequest request) {
        InspectionPoint point = inspectionPointService.getByCode(code);

        Inspection inspection = Inspection.builder()
                .inspectionPoint(point)
                .inspectionDate(request.getInspectionDate())
                .responsibleName(request.getResponsibleName())
                .inspector(currentUser())
                .visualCondition(request.getVisualCondition())
                .electricalContinuityMohm(request.getElectricalContinuityMohm())
                .groundingResistanceOhm(request.getGroundingResistanceOhm())
                .hasOxidation(request.isHasOxidation())
                .needsCorrection(request.isNeedsCorrection())
                .conforming(request.isConforming())
                .observations(request.getObservations())
                .photoUrl(request.getPhotoUrl())
                .build();

        return inspectionRepository.save(inspection);
    }

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal instanceof UserPrincipal userPrincipal ? userPrincipal.getUser() : null;
    }
}
