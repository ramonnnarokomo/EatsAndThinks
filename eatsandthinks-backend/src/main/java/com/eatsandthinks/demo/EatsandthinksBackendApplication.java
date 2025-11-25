package com.eatsandthinks.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
public class EatsandthinksBackendApplication {

	public static void main(String[] args) {
		ConfigurableApplicationContext context = SpringApplication.run(EatsandthinksBackendApplication.class, args);
		Environment env = context.getEnvironment();
		String url = env.getProperty("spring.datasource.url");
		String user = env.getProperty("spring.datasource.username");
		
		System.out.println("=========================================");
		System.out.println("🔍 DEBUG CONEXIÓN DB");
		System.out.println("URL: " + url);
		System.out.println("USER: " + user);
		System.out.println("=========================================");
	}

}