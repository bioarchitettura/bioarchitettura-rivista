# Bioarchitettura Slideshow Component

A stunning, responsive, and accessible slideshow component designed specifically for the bioarchitettura website.

## Features

### Core Functionality
- **Responsive Design**: Adapts seamlessly from desktop to mobile devices
- **Touch/Swipe Support**: Native touch gestures for mobile navigation
- **Keyboard Navigation**: Full keyboard accessibility with arrow keys, space, Home/End
- **Auto-play**: Automatic slide progression with customizable intervals
- **Smooth Transitions**: CSS-based animations with hardware acceleration
- **Loop Mode**: Infinite scrolling through slides

### Accessibility Features
- **ARIA Roles**: Complete screen reader support with proper ARIA attributes
- **Keyboard Navigation**: Tab-accessible with intuitive key controls
- **Focus Management**: Visual focus indicators and logical tab order
- **Motion Preferences**: Respects `prefers-reduced-motion` user settings
- **High Contrast**: Supports high contrast mode for better visibility

### Performance Optimizations
- **Lazy Loading**: Images load only when needed to improve page speed
- **Intersection Observer**: Efficient visibility detection
- **Hardware Acceleration**: CSS transforms for smooth animations
- **Memory Management**: Proper cleanup and event listener removal

### Customization Options
- **Multiple Transition Effects**: Slide, fade, and custom animations
- **Configurable Controls**: Show/hide navigation elements
- **Theming Support**: Uses CSS custom properties for easy styling
- **Image Sources**: Support for various image formats and sizes

## Usage

### Basic HTML Structure

```html
<div class="bioarchitettura-slideshow" 
     data-autoplay="true" 
     data-interval="5000"
     data-controls="true" 
     data-indicators="true">
    <!-- Slideshow content will be generated automatically -->
</div>
```

### JavaScript Initialization

The slideshow initializes automatically on page load, but can also be manually initialized:

```javascript
// Automatic initialization (recommended)
// Looks for elements with class 'bioarchitettura-slideshow'

// Manual initialization
const slideshow = new BioarchitetturaSlideshow('.my-slideshow', {
    autoPlay: true,
    interval: 6000,
    showControls: true,
    showIndicators: true,
    loop: true
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoPlay` | boolean | true | Enable automatic slide progression |
| `interval` | number | 5000 | Time between slides in milliseconds |
| `showControls` | boolean | true | Show previous/next navigation buttons |
| `showIndicators` | boolean | true | Show slide indicator dots |
| `showPlayPause` | boolean | true | Show play/pause control button |
| `loop` | boolean | true | Enable infinite loop through slides |
| `keyboard` | boolean | true | Enable keyboard navigation |
| `touch` | boolean | true | Enable touch/swipe gestures |
| `lazy` | boolean | true | Enable lazy loading of images |
| `pauseOnHover` | boolean | true | Pause autoplay when hovering |

### Data Attributes

Configure the slideshow using HTML data attributes:

```html
<div class="bioarchitettura-slideshow"
     data-autoplay="true"
     data-interval="6000"
     data-controls="true"
     data-indicators="true"
     data-playpause="true"
     data-loop="true"
     data-keyboard="true"
     data-touch="true"
     data-lazy="true"
     data-pauseonhover="true">
</div>
```

### Custom Slide Data

Provide custom slides via JSON data attribute:

```html
<div class="bioarchitettura-slideshow" 
     data-slides='[
       {
         "src": "image1.jpg",
         "alt": "Description",
         "title": "Slide Title",
         "caption": "Slide caption text"
       },
       {
         "src": "image2.jpg", 
         "alt": "Description",
         "title": "Another Title",
         "caption": "Another caption"
       }
     ]'>
</div>
```

## Default Images

The slideshow comes with predefined bioarchitecture-related images:

1. **33n002.jpg** - Sustainable Architecture Project
2. **bio_47_n064.jpg** - Passive House Example  
3. **Bioarchitettura_71_p.jpg** - Bioarchitettura Magazine Cover
4. **36p044f01.jpg** - Natural Building Materials

## CSS Integration

The slideshow integrates seamlessly with the existing bioarchitettura design system:

- Uses existing CSS custom properties (variables)
- Follows the established color palette (green #2c5530, accent #f4a261)
- Compatible with the responsive grid system
- Matches existing typography (Playfair Display, Inter)

## Browser Support

- **Modern Browsers**: Full support (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- **Internet Explorer**: Not supported (uses modern CSS features)
- **Mobile**: iOS Safari 12+, Chrome for Android 60+

## Keyboard Controls

- **Arrow Left/Up**: Previous slide
- **Arrow Right/Down**: Next slide  
- **Space/Enter**: Toggle play/pause
- **Home**: Go to first slide
- **End**: Go to last slide
- **Tab**: Navigate through controls

## Mobile Gestures

- **Swipe Left**: Next slide
- **Swipe Right**: Previous slide
- **Tap**: Pause/resume autoplay
- **Long Press**: Show controls

## CSS Classes

### Main Components
- `.bioarchitettura-slideshow`: Main container
- `.slideshow-container`: Inner container
- `.slideshow-slides`: Slides wrapper
- `.slideshow-slide`: Individual slide
- `.slideshow-caption`: Caption overlay

### Controls
- `.slideshow-nav`: Navigation buttons
- `.slideshow-indicators`: Indicator dots container
- `.slideshow-indicator`: Individual indicator
- `.slideshow-play-pause`: Play/pause button
- `.slideshow-progress`: Progress bar

### States
- `.active`: Active slide/indicator
- `.swiping`: During touch interaction
- `.loaded`: Lazy-loaded image

## API Methods

```javascript
const slideshow = new BioarchitetturaSlideshow('.slideshow');

// Navigation
slideshow.nextSlide();
slideshow.prevSlide();
slideshow.goToSlide(2);

// Playback control
slideshow.startAutoPlay();
slideshow.pauseAutoPlay();
slideshow.togglePlayPause();

// Information
slideshow.getCurrentSlide(); // Returns current slide index
slideshow.getTotalSlides();  // Returns total number of slides

// Lifecycle
slideshow.updateSlides(newSlidesArray); // Update slides
slideshow.destroy(); // Clean up and remove
```

## Styling Customization

Override CSS custom properties to customize appearance:

```css
.bioarchitettura-slideshow {
    --slideshow-height: 400px;
    --slideshow-border-radius: 12px;
    --slideshow-shadow: 0 10px 25px rgba(0,0,0,0.15);
}
```

## Integration with Jekyll

The component is designed to work seamlessly with the Jekyll-based bioarchitettura website:

1. CSS is imported in `main.css`
2. JavaScript is loaded in the default layout
3. Can be used in any page or post with the appropriate HTML structure

## Performance Considerations

- Images are lazy-loaded to improve initial page load
- CSS animations use `transform` for hardware acceleration
- Event listeners are properly cleaned up to prevent memory leaks
- Autoplay pauses when the page is not visible
- Minimal DOM manipulation for smooth performance

## Accessibility Compliance

- **WCAG 2.1 AA Compliant**: Meets accessibility guidelines
- **Screen Reader Friendly**: Proper ARIA labels and live regions
- **Keyboard Accessible**: Full functionality via keyboard
- **Focus Visible**: Clear focus indicators for all interactive elements
- **Motion Sensitivity**: Respects user motion preferences

## Testing

Test the slideshow using the included test file:
```
slideshow-test.html
```

This provides a comprehensive testing environment with all features enabled.

## Support

For issues or feature requests, refer to the main bioarchitettura project repository.