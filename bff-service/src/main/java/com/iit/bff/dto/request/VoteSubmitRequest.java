package com.iit.bff.dto.request;

import lombok.Data;

@Data
public class VoteSubmitRequest {
    private String submissionId;
    /** UP or DOWN */
    private String voteType;
}
