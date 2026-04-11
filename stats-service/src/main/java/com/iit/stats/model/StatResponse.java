package com.iit.stats.model;

public class StatResponse {
    private int count;
    private double average;
    private double sum;
    private double median;

    public StatResponse(int count, double average, double sum, double median) {
        this.count = count;
        this.average = average;
        this.sum = sum;
        this.median = median;
    }

    public int getCount() {
        return count;
    }

    public double getAverage() {
        return average;
    }

    public double getSum() {
        return sum;
    }

    public double getMedian() {
        return median;
    }
}
