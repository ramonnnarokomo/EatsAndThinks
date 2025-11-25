package com.eatsandthinks.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

//@Component
public class DataLoader implements CommandLineRunner {

    // private final LocalRepository localRepository;
    
    // public DataLoader(LocalRepository localRepository) {
    //     this.localRepository = localRepository;
    // }

    //@Override
    public void run(String... args) throws Exception {
        // COMENTA ESTO TEMPORALMENTE:
        // long count = localRepository.count();
        // if (count == 0) {
        //     // Cargar datos iniciales
        // }
        
        System.out.println("✅ DataLoader ejecutado (sin verificar tablas)");
    }
}