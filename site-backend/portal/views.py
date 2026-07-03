import logging

import requests
from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)


class HealthView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response({"status": "ok", "service": "vcuy-public-site"})


class PublicStatsView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        stats = {
            "active_volunteers": 0,
            "tasks_completed": 0,
            "community_contributions": 0,
            "system_status": "ok",
            "source": "fallback",
        }
        try:
            resp = requests.get(
                f"{settings.COORDINATOR_API_URL.rstrip('/')}/system-health/",
                timeout=5,
                headers={"Host": "coordinator-vc-uy.npe-techs.com"},
            )
            if resp.ok:
                data = resp.json()
                details = data.get("details", {})
                stats.update(
                    {
                        "active_volunteers": details.get("active_volunteers", 0),
                        "system_status": data.get("status", "ok"),
                        "source": "coordinator",
                    }
                )
        except Exception as exc:
            logger.debug("Coordinator stats unavailable: %s", exc)
        return Response(stats)


class MissionView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response(
            {
                "title": "VolunSys-UY1 — Calcul volontaire frugal",
                "institution": "Université de Yaoundé I",
                "program": "Master 2 Informatique — Systèmes et Réseaux",
                "supervisor": "Dr ADAMOU HAMZA",
                "research_question": (
                    "Comment concevoir et tester une stratégie frugale de recrutement, "
                    "de motivation et de récompenses, adaptée au contexte socio-culturel "
                    "et économique des pays en développement ?"
                ),
                "pillars": [
                    {
                        "title": "Recrutement ciblé",
                        "description": (
                            "Milieu académique, institutions et communautés locales "
                            "pour faire connaître le calcul volontaire."
                        ),
                    },
                    {
                        "title": "Gamification culturelle",
                        "description": (
                            "Badges, classements et storytelling de l'impact scientifique "
                            "pour valoriser chaque contribution."
                        ),
                    },
                    {
                        "title": "Micro-récompenses frugales",
                        "description": (
                            "Reconnaissance publique, accès privilégié aux ressources, "
                            "crédits de communication — des incitations à forte valeur "
                            "perçue, sans infrastructure coûteuse."
                        ),
                    },
                    {
                        "title": "Confiance et transparence",
                        "description": (
                            "Exécution isolée dans Docker, suivi en temps réel et "
                            "communication claire sur l'usage des ressources partagées."
                        ),
                    },
                ],
                "objectives": [
                    "Cartographier les leviers de motivation locaux",
                    "Concevoir une stratégie de recrutement adaptée",
                    "Intégrer des mécanismes de gamification contextualisés",
                    "Développer des micro-récompenses à faible coût",
                    "Évaluer l'impact sur participation et fidélisation",
                ],
            }
        )


class InstallGuideView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        host = settings.COORDINATOR_REDIS_HOST
        port = settings.REDIS_PROXY_PORT
        repo = settings.VOLUNTEER_REPO_URL
        return Response(
            {
                "repository": repo,
                "coordinator": {"host": host, "proxy_port": int(port)},
                "requirements": [
                    "Python 3.10 ou supérieur",
                    "Docker (service démarré)",
                    "Git",
                    "4 Go de RAM recommandés",
                    "Connexion Internet stable",
                    "Windows : PowerShell en mode administrateur pour l'installation",
                ],
                "platforms": {
                    "linux": {
                        "title": "Linux / macOS",
                        "steps": [
                            f"git clone {repo}.git && cd volunteer-app-2025/volontaire",
                            "chmod +x install.sh run.sh",
                            "./install.sh",
                            "newgrp docker  # ou déconnexion/reconnexion si demandé",
                            f"Configurer le coordinateur : hôte {host}, port proxy {port}",
                            "./run.sh",
                            "Ouvrir http://localhost:8003 dans le navigateur",
                        ],
                    },
                    "windows": {
                        "title": "Windows",
                        "steps": [
                            f"git clone {repo}.git",
                            "cd volunteer-app-2025\\volontaire",
                            "Ouvrir PowerShell en administrateur",
                            "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser",
                            ".\\install_windows.ps1",
                            f"Configurer le coordinateur : hôte {host}, port proxy {port}",
                            ".\\run_windows.ps1",
                            "Ouvrir http://localhost:8003 dans le navigateur",
                        ],
                    },
                },
                "configuration": {
                    "title": "Connexion au coordinateur",
                    "fields": [
                        {
                            "name": "COORDINATOR_HOST",
                            "value": host,
                            "description": "Adresse du proxy Redis du coordinateur",
                        },
                        {
                            "name": "COORDINATOR_PROXY_PORT",
                            "value": port,
                            "description": "Port du proxy (volontaires et managers)",
                        },
                    ],
                    "note": (
                        "Ces paramètres sont demandés au premier lancement de "
                        "l'application volontaire ou dans le fichier .env du projet."
                    ),
                },
                "verification": [
                    "L'interface volontaire s'affiche sans erreur",
                    "Le statut passe à « disponible » dans le tableau de bord",
                    "Les logs ne montrent pas d'erreur de connexion Redis",
                ],
                "troubleshooting": [
                    {
                        "problem": "Permission denied sur Docker",
                        "solution": "sudo usermod -aG docker $USER puis newgrp docker",
                    },
                    {
                        "problem": "Connexion Redis refusée",
                        "solution": f"Vérifier que {host}:{port} est accessible (pare-feu, proxy DNS-only)",
                    },
                    {
                        "problem": "Image Docker introuvable",
                        "solution": "Relancer install.sh ou charger task_docker_img/image-docker.tar si fourni",
                    },
                    {
                        "problem": "Port déjà utilisé",
                        "solution": "Arrêter l'autre processus ou modifier le port dans la configuration",
                    },
                ],
            }
        )
