package com.iit.vote.model;

public class VoteResponse {
    private String submissionId;
    private int upvotes;
    private int downvotes;

    public VoteResponse(String submissionId, int upvotes, int downvotes)
    {
        this.submissionId = submissionId;
        this.upvotes = upvotes;
        this.downvotes = downvotes;
    }

    public String getSubmissionId()
    { return submissionId;
    }

    public int getUpvotes() {
        return upvotes;
    }

    public int getDownvotes() {
        return downvotes;
    }
}

