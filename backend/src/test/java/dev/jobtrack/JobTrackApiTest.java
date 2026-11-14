package dev.jobtrack;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class JobTrackApiTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;

    private String register(String email) throws Exception {
        String body = mapper.writeValueAsString(java.util.Map.of("email", email, "password", "password123"));
        String response = mvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return mapper.readTree(response).get("token").asText();
    }

    private String uniqueEmail() {
        return UUID.randomUUID() + "@example.com";
    }

    @Test
    void endpointProtettiSenzaTokenRispondono401() throws Exception {
        mvc.perform(get("/api/applications")).andExpect(status().isUnauthorized());
    }

    @Test
    void loginConPasswordSbagliataRispondono401() throws Exception {
        String email = uniqueEmail();
        register(email);
        String body = mapper.writeValueAsString(java.util.Map.of("email", email, "password", "sbagliata!"));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registrazioneDuplicataRispondeConflict() throws Exception {
        String email = uniqueEmail();
        register(email);
        String body = mapper.writeValueAsString(java.util.Map.of("email", email, "password", "password123"));
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void validazioneRifiutaDatiNonValidi() throws Exception {
        String token = register(uniqueEmail());
        mvc.perform(post("/api/applications")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"company\":\"\",\"role\":\"Dev\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.company").exists());
    }

    @Test
    void ciclo_completo_crea_lista_cambiaStato_elimina() throws Exception {
        String token = register(uniqueEmail());

        String created = mvc.perform(post("/api/applications")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"company\":\"Acme\",\"role\":\"Full Stack Developer\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("WISHLIST"))
                .andReturn().getResponse().getContentAsString();
        JsonNode node = mapper.readTree(created);
        long id = node.get("id").asLong();

        mvc.perform(get("/api/applications").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mvc.perform(patch("/api/applications/" + id + "/status")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"INTERVIEW\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INTERVIEW"));

        mvc.perform(get("/api/applications?status=INTERVIEW").header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/api/applications?status=OFFER").header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.length()").value(0));

        mvc.perform(delete("/api/applications/" + id).header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/applications/" + id).header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void unUtenteNonVedeLeCandidatureDiUnAltro() throws Exception {
        String tokenA = register(uniqueEmail());
        String tokenB = register(uniqueEmail());

        String created = mvc.perform(post("/api/applications")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"company\":\"Privata\",\"role\":\"Dev\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long id = mapper.readTree(created).get("id").asLong();

        mvc.perform(get("/api/applications/" + id).header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/applications").header("Authorization", "Bearer " + tokenB))
                .andExpect(jsonPath("$.length()").value(0));
    }
}
