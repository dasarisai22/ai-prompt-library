import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="about-container fade-in-up">
      <div class="hero-content">
        <div class="badge glow-pulse">Our Mission</div>
        <h1 class="hero-title">Empowering <span class="gradient-text">Creativity</span></h1>
        
        <p class="hero-description">
          Welcome to the AI Prompt Library, a curated haven for digital dreamers. 
          Our motive is simple: to build a collaborative space where the world's most 
          imaginative AI prompts can be shared, discovered, and refined.
        </p>

        <blockquote class="motivational-quote">
          <div class="quote-icon">“</div>
          <p>{{ randomQuote.text }}</p>
          <footer>— {{ randomQuote.author }}</footer>
        </blockquote>

        <div class="features-grid">
          <div class="feature-card glass-panel" *ngFor="let f of features; let i = index" [style.animationDelay]="(i * 0.2) + 's'">
            <div class="feature-icon">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.text }}</p>
          </div>
        </div>

        <div class="cta-section">
          <a routerLink="/prompts" class="btn btn-primary btn-glow btn-large">
            Start Exploring
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .about-container {
      padding: 4rem 2rem;
      max-width: 900px;
      margin: 0 auto;
      text-align: center;
      position: relative;
    }
    .badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 50px;
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid rgba(139, 92, 246, 0.5);
      color: #c4b5fd;
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 2rem;
    }
    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
      color: #f8fafc;
      letter-spacing: -1px;
    }
    .hero-description {
      font-size: 1.25rem;
      line-height: 1.8;
      color: #cbd5e1;
      margin-bottom: 3rem;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
    }
    .motivational-quote {
      position: relative;
      margin: 4rem auto;
      padding: 2.5rem;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 20px;
      border-left: 4px solid #8b5cf6;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      max-width: 600px;
    }
    .quote-icon {
      position: absolute;
      top: -20px;
      left: 20px;
      font-size: 5rem;
      color: rgba(139, 92, 246, 0.3);
      font-family: serif;
      line-height: 1;
    }
    .motivational-quote p {
      font-size: 1.5rem;
      font-style: italic;
      color: #e2e8f0;
      margin-bottom: 1rem;
    }
    .motivational-quote footer {
      color: #94a3b8;
      font-size: 1rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin: 4rem 0;
    }
    .feature-card {
      padding: 2rem;
      border-radius: 16px;
      text-align: left;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      opacity: 0;
      animation: slideInUp 0.8s ease-out forwards;
    }
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(139, 92, 246, 0.2);
    }
    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    .feature-card h3 {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #f1f5f9;
    }
    .feature-card p {
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.6;
    }
    .cta-section {
      margin-top: 4rem;
    }
    .btn-large {
      font-size: 1.1rem;
      padding: 1rem 2.5rem;
      border-radius: 50px;
    }
    
    /* Animations */
    .fade-in-up {
      animation: fadeInUp 1s ease-out;
    }
    .glow-pulse {
      animation: glowPulse 2s infinite alternate;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes glowPulse {
      0% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.2); }
      100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.6); }
    }
  `]
})
export class AboutComponent implements OnInit {
  features = [
    { icon: '✨', title: 'Discover', text: 'Find the perfect words to ignite your AI image generation and push creative boundaries.' },
    { icon: '🚀', title: 'Share', text: 'Contribute your own masterpieces to a growing community of digital artists and prompt engineers.' },
    { icon: '🔥', title: 'Track', text: 'See which prompts resonate most with live view counters showing real-time popularity.' }
  ];

  quotes = [
    { text: "The true sign of intelligence is not knowledge but imagination.", author: "Albert Einstein" },
    { text: "Creativity is just connecting things.", author: "Steve Jobs" },
    { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
    { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke" },
    { text: "The art challenges the technology, and the technology inspires the art.", author: "John Lasseter" },
    { text: "You can't use up creativity. The more you use, the more you have.", author: "Maya Angelou" }
  ];

  randomQuote = this.quotes[0];

  ngOnInit() {
    this.randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
  }
}
