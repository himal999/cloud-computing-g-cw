package com.iit.bff.model;

public class SalarySubmission {
    private String country;
    private String company;
    private String role;
    private String level;
    private int yearsExperience;
    private double amount;
    private String currency;

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public int getYearsExperience() { return yearsExperience; }
    public void setYearsExperience(int yearsExperience) { this.yearsExperience = yearsExperience; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}
