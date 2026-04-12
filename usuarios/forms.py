from django import forms
from django.core.exceptions import ValidationError
import re
from .models import SolicitudRegistro


class SolicitudRegistroForm(forms.ModelForm):
    """Formulario para crear solicitudes de registro"""
    
    class Meta:
        model = SolicitudRegistro
        fields = ['nombre', 'email', 'telefono', 'departamento', 'puesto', 'superior', 'fecha_ingreso']
        widgets = {
            'nombre': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nombre completo'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'correo@empresa.com'}),
            'telefono': forms.TextInput(attrs={'class': 'form-control', 'placeholder': '+54 9 XXXX-XXXX'}),
            'departamento': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ej: Ventas, TI, RH'}),
            'puesto': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ej: Gerente, Técnico'}),
            'superior': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nombre del superior (opcional)'}),
            'fecha_ingreso': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
        }
    
    def clean_nombre(self):
        nombre = self.cleaned_data.get('nombre', '').strip()
        if not nombre or len(nombre) < 3:
            raise ValidationError('El nombre debe tener al menos 3 caracteres')
        return nombre
    
    def clean_email(self):
        email = self.cleaned_data.get('email', '').strip()
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            raise ValidationError('Ingrese un correo electrónico válido')
        return email
    
    def clean_telefono(self):
        telefono = self.cleaned_data.get('telefono', '').strip()
        if not re.match(r'^[\+]?[0-9\s\-\(\)]{8,}$', telefono):
            raise ValidationError('Ingrese un número de teléfono válido')
        return telefono
    
    def clean_departamento(self):
        departamento = self.cleaned_data.get('departamento', '').strip()
        if not departamento:
            raise ValidationError('El departamento es obligatorio')
        return departamento
    
    def clean_puesto(self):
        puesto = self.cleaned_data.get('puesto', '').strip()
        if not puesto:
            raise ValidationError('El puesto es obligatorio')
        return puesto
