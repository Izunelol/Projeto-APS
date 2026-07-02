package com.smartlab.rastreabilidade.inspectionpoint;

import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

public final class InspectionPointSpecifications {

    private InspectionPointSpecifications() {
    }

    public static Specification<InspectionPoint> hasClient(UUID clientId) {
        if (clientId == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("client").get("id"), clientId);
    }

    public static Specification<InspectionPoint> hasArea(UUID areaId) {
        if (areaId == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("area").get("id"), areaId);
    }

    public static Specification<InspectionPoint> hasPointType(UUID pointTypeId) {
        if (pointTypeId == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("pointType").get("id"), pointTypeId);
    }

    public static Specification<InspectionPoint> hasStatus(PointStatus status) {
        if (status == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }
}
