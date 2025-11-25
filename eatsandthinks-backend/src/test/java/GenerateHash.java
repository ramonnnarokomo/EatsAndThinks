import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode("adminramon");
        System.out.println("Hash para 'adminramon':");
        System.out.println(hash);
        System.out.println("\nSQL:");
        System.out.println("DELETE FROM usuarios WHERE email = 'admin@gmail.com';");
        System.out.println("INSERT INTO usuarios (created_at, email, nombre, password, role, banned, can_review)");
        System.out.println("VALUES (NOW(6), 'admin@gmail.com', 'Administrator', '" + hash + "', 'ROLE_ADMIN', FALSE, TRUE);");
    }
}

