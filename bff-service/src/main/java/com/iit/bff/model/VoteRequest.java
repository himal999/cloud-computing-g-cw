package com.iit.bff.model;

public class VoteRequest {
    private String submissionId;
    private String voteType;
    private String userId;

    public String getSubmissionId() { return submissionId; }
    public void setSubmissionId(String submissionId) { this.submissionId = submissionId; }
    public String getVoteType() { return voteType; }
    public void setVoteType(String voteType) { this.voteType = voteType; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
