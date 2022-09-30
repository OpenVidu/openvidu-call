package io.openvidu.call.java.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.configurers.ExpressionUrlAuthorizationConfigurer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;


@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

	@Value("${CALL_USER}")
	private String CALL_USER;

	@Value("${CALL_SECRET}")
	private String CALL_SECRET;

	@Value("${CALL_PRIVATE_ACCESS}")
	private String CALL_PRIVATE_ACCESS;


	@Override
	protected void configure(HttpSecurity http) throws Exception {
		
		ExpressionUrlAuthorizationConfigurer<HttpSecurity>.ExpressionInterceptUrlRegistry conf = http.cors().and()
				.csrf().disable().authorizeRequests()
				.antMatchers("/call/**").permitAll()
				.antMatchers("/auth/**").permitAll();
		
		if(CALL_PRIVATE_ACCESS.equals("ENABLED")) {
			conf.and().authorizeRequests().antMatchers("/recordings/**").authenticated();
			conf.and().authorizeRequests().antMatchers("/sessions/**").authenticated();
		} else {
			System.out.println("PUBLIC ACCESS");
			conf.and().authorizeRequests().antMatchers("/recordings/**").permitAll();
			conf.and().authorizeRequests().antMatchers("/sessions/**").permitAll();
		}
		
		conf.and().httpBasic();

	}

	@Bean
	public CorsFilter corsFilter() {
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(Arrays.asList("*"));
		config.setAllowedHeaders(Arrays.asList("*"));
		config.setAllowedMethods(Arrays.asList("*"));
		source.registerCorsConfiguration("/**", config);
		return new CorsFilter(source);
	}
	
	@Autowired
	public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
		auth.inMemoryAuthentication().withUser(CALL_USER).password("{noop}" + CALL_SECRET)
				.roles("ADMIN");
	}

}
